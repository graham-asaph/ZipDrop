(function() {
    "use strict";

    /**
     * Manages selected files and ZIP entry metadata.
     * @returns {{ addFiles: function(FileList|File[]): void, removeFile: function(number): void, clearFiles: function(): void, getFiles: function(): File[], getTotalSize: function(): number, setZipEntries: function(Array<{name: string, size: number}>): void, getZipEntries: function(): Array<{name: string, size: number}> }}
     */
    var fileHandler = (function() {
        /** @type {File[]} */
        var selectedFiles = [];

        /** @type {Array<{name: string, size: number}>} */
        var zipEntries = [];

        /**
         * Adds files to the current in-memory selection.
         * @param {FileList|File[]} files - Files from input or drag/drop.
         */
        function addFiles(files) {
            var incoming = Array.prototype.slice.call(files || []);
            selectedFiles = selectedFiles.concat(incoming);
        }

        /**
         * Removes one file from the selected list by index.
         * @param {number} index - Zero-based index.
         */
        function removeFile(index) {
            if (index < 0 || index >= selectedFiles.length) {
                return;
            }
            selectedFiles.splice(index, 1);
        }

        /**
         * Clears all selected files.
         */
        function clearFiles() {
            selectedFiles = [];
        }

        /**
         * Reads selected files.
         * @returns {File[]} Selected files.
         */
        function getFiles() {
            return selectedFiles.slice();
        }

        /**
         * Calculates the total bytes of selected files.
         * @returns {number} Total bytes.
         */
        function getTotalSize() {
            return selectedFiles.reduce(function(sum, file) {
                return sum + file.size;
            }, 0);
        }

        /**
         * Sets currently previewed ZIP entries.
         * @param {Array<{name: string, size: number}>} entries - ZIP entry metadata.
         */
        function setZipEntries(entries) {
            zipEntries = entries.slice();
        }

        /**
         * Gets currently previewed ZIP entries.
         * @returns {Array<{name: string, size: number}>} ZIP entries.
         */
        function getZipEntries() {
            return zipEntries.slice();
        }

        return {
            addFiles: addFiles,
            removeFile: removeFile,
            clearFiles: clearFiles,
            getFiles: getFiles,
            getTotalSize: getTotalSize,
            setZipEntries: setZipEntries,
            getZipEntries: getZipEntries
        };
    })();

    /**
     * Wraps compression, extraction, and file download operations.
     * @returns {{ compressFiles: function(File[], string, function(number): void): Promise<{blob: Blob, zipName: string, compressedSize: number, originalSize: number}>, parseZipFile: function(File): Promise<{zip: any, entries: Array<{name: string, size: number}>}>, extractAllEntries: function(any, function(string): void): Promise<void>, downloadBlob: function(Blob, string): void, shareZip: function(Blob, string): Promise<boolean> }}
     */
    var compressionService = (function() {
        /**
         * Compresses a set of files into a ZIP blob.
         * @param {File[]} files - Files to include.
         * @param {string} outputName - Desired output filename without extension.
         * @param {function(number): void} onProgress - Progress callback receiving percentage.
         * @returns {Promise<{blob: Blob, zipName: string, compressedSize: number, originalSize: number}>} Compression result.
         */
        async function compressFiles(files, outputName, onProgress) {
            if (!window.JSZip) {
                throw new Error("JSZip failed to load. Check internet connectivity and reload.");
            }
            if (!files || files.length === 0) {
                throw new Error("Please select at least one file before compressing.");
            }

            var zip = new JSZip();
            files.forEach(function(file) {
                zip.file(file.name, file);
            });

            var originalSize = files.reduce(function(sum, file) {
                return sum + file.size;
            }, 0);

            var blob = await zip.generateAsync({
                    type: "blob",
                    compression: "DEFLATE",
                    compressionOptions: { level: 6 }
                },
                function(metadata) {
                    if (typeof onProgress === "function") {
                        onProgress(Math.round(metadata.percent));
                    }
                }
            );

            var safeName = sanitizeOutputName(outputName);
            var zipName = safeName + ".zip";

            return {
                blob: blob,
                zipName: zipName,
                compressedSize: blob.size,
                originalSize: originalSize
            };
        }

        /**
         * Reads an uploaded ZIP and returns entry metadata.
         * @param {File} zipFile - ZIP file selected by user.
         * @returns {Promise<{zip: any, entries: Array<{name: string, size: number}>}>} Parsed ZIP and entries.
         */
        async function parseZipFile(zipFile) {
            if (!window.JSZip) {
                throw new Error("JSZip failed to load. Check internet connectivity and reload.");
            }
            if (!zipFile) {
                throw new Error("Please choose a ZIP file to open.");
            }

            var zip = await JSZip.loadAsync(zipFile);
            var names = Object.keys(zip.files);
            var entries = [];

            for (var i = 0; i < names.length; i += 1) {
                var name = names[i];
                var entry = zip.files[name];

                if (entry.dir) {
                    continue;
                }

                var data = await entry.async("uint8array");
                entries.push({
                    name: entry.name,
                    size: data.byteLength
                });
            }

            return { zip: zip, entries: entries };
        }

        /**
         * Extracts each non-directory ZIP entry as an individual browser download.
         * @param {any} zip - JSZip instance.
         * @param {function(string): void} onEachExtract - Callback called with filename.
         * @returns {Promise<void>} Resolves when extraction attempts finish.
         */
        async function extractAllEntries(zip, onEachExtract) {
            if (!zip) {
                throw new Error("No ZIP is currently loaded.");
            }

            var names = Object.keys(zip.files);
            for (var i = 0; i < names.length; i += 1) {
                var name = names[i];
                var entry = zip.files[name];

                if (entry.dir) {
                    continue;
                }

                var blob = await entry.async("blob");
                downloadBlob(blob, getLeafName(entry.name));

                if (typeof onEachExtract === "function") {
                    onEachExtract(entry.name);
                }
            }
        }

        /**
         * Triggers a browser download for a given blob.
         * @param {Blob} blob - File data.
         * @param {string} fileName - Download filename.
         */
        function downloadBlob(blob, fileName) {
            var url = URL.createObjectURL(blob);
            var anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = fileName;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            URL.revokeObjectURL(url);
        }

        /**
         * Shares the generated ZIP with Web Share API when supported.
         * @param {Blob} blob - ZIP file blob.
         * @param {string} fileName - ZIP filename.
         * @returns {Promise<boolean>} True if shared, false if unsupported.
         */
        async function shareZip(blob, fileName) {
            if (!navigator.share || !window.File) {
                return false;
            }

            var shareFile = new File([blob], fileName, { type: "application/zip" });
            if (navigator.canShare && !navigator.canShare({ files: [shareFile] })) {
                return false;
            }

            await navigator.share({
                title: "ZipDrop Archive",
                text: "Compressed with ZipDrop",
                files: [shareFile]
            });

            return true;
        }

        /**
         * Ensures output name is safe and non-empty.
         * @param {string} name - Raw output name.
         * @returns {string} Sanitized output name.
         */
        function sanitizeOutputName(name) {
            var cleaned = String(name || "zipdrop-archive")
                .trim()
                .replace(/[\\/:*?"<>|]/g, "-")
                .replace(/\s+/g, "-");
            return cleaned || "zipdrop-archive";
        }

        /**
         * Converts a ZIP path into filename for browser downloads.
         * @param {string} fullPath - ZIP entry path.
         * @returns {string} Leaf filename.
         */
        function getLeafName(fullPath) {
            var parts = String(fullPath).split("/");
            return parts[parts.length - 1] || "extracted-file";
        }

        return {
            compressFiles: compressFiles,
            parseZipFile: parseZipFile,
            extractAllEntries: extractAllEntries,
            downloadBlob: downloadBlob,
            shareZip: shareZip
        };
    })();

    /**
     * Handles DOM events, rendering, theming, and feedback messages.
     * @returns {{ init: function(): void }}
     */
    var uiController = (function() {
        /** @type {HTMLElement|null} */
        var dropZone;
        /** @type {HTMLInputElement|null} */
        var fileInput;
        /** @type {HTMLButtonElement|null} */
        var selectFilesBtn;
        /** @type {HTMLUListElement|null} */
        var selectedFilesList;
        /** @type {HTMLElement|null} */
        var fileCount;
        /** @type {HTMLElement|null} */
        var totalSize;
        /** @type {HTMLButtonElement|null} */
        var compressBtn;
        /** @type {HTMLButtonElement|null} */
        var clearBtn;
        /** @type {HTMLElement|null} */
        var progressBar;
        /** @type {HTMLElement|null} */
        var progressText;
        /** @type {HTMLElement|null} */
        var errorBanner;
        /** @type {HTMLElement|null} */
        var successBanner;
        /** @type {HTMLElement|null} */
        var compressionStats;
        /** @type {HTMLElement|null} */
        var originalSize;
        /** @type {HTMLElement|null} */
        var zipSize;
        /** @type {HTMLElement|null} */
        var savedPercent;
        /** @type {HTMLElement|null} */
        var zipFileName;
        /** @type {HTMLInputElement|null} */
        var outputName;
        /** @type {HTMLInputElement|null} */
        var zipInput;
        /** @type {HTMLButtonElement|null} */
        var openZipBtn;
        /** @type {HTMLUListElement|null} */
        var zipEntriesList;
        /** @type {HTMLButtonElement|null} */
        var extractAllBtn;
        /** @type {HTMLButtonElement|null} */
        var themeToggle;
        /** @type {HTMLButtonElement|null} */
        var shareBtn;

        /** @type {Blob|null} */
        var latestZipBlob = null;
        /** @type {string} */
        var latestZipName = "";
        /** @type {any|null} */
        var openedZip = null;

        /**
         * Initializes app UI and event bindings.
         */
        function init() {
            cacheDom();
            applySavedTheme();
            bindEvents();
            renderSelectedFiles();
            renderZipEntries([]);
            setProgress(0);
        }

        /**
         * Resolves all required DOM nodes.
         */
        function cacheDom() {
            dropZone = document.getElementById("dropZone");
            fileInput = document.getElementById("fileInput");
            selectFilesBtn = document.getElementById("selectFilesBtn");
            selectedFilesList = document.getElementById("selectedFilesList");
            fileCount = document.getElementById("fileCount");
            totalSize = document.getElementById("totalSize");
            compressBtn = document.getElementById("compressBtn");
            clearBtn = document.getElementById("clearBtn");
            progressBar = document.getElementById("progressBar");
            progressText = document.getElementById("progressText");
            errorBanner = document.getElementById("errorBanner");
            successBanner = document.getElementById("successBanner");
            compressionStats = document.getElementById("compressionStats");
            originalSize = document.getElementById("originalSize");
            zipSize = document.getElementById("zipSize");
            savedPercent = document.getElementById("savedPercent");
            zipFileName = document.getElementById("zipFileName");
            outputName = document.getElementById("outputName");
            zipInput = document.getElementById("zipInput");
            openZipBtn = document.getElementById("openZipBtn");
            zipEntriesList = document.getElementById("zipEntriesList");
            extractAllBtn = document.getElementById("extractAllBtn");
            themeToggle = document.getElementById("themeToggle");
            shareBtn = document.getElementById("shareBtn");
        }

        /**
         * Wires all interaction listeners.
         */
        function bindEvents() {
            if (selectFilesBtn && fileInput) {
                selectFilesBtn.addEventListener("click", function() {
                    fileInput.click();
                });

                fileInput.addEventListener("change", function(event) {
                    try {
                        var target = /** @type {HTMLInputElement} */ (event.target);
                        fileHandler.addFiles(target.files || []);
                        target.value = "";
                        renderSelectedFiles();
                        hideError();
                    } catch (error) {
                        showError(error);
                    }
                });
            }

            if (dropZone) {
                dropZone.addEventListener("click", function() {
                    if (fileInput) {
                        fileInput.click();
                    }
                });

                dropZone.addEventListener("keydown", function(event) {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        if (fileInput) {
                            fileInput.click();
                        }
                    }
                });

                ["dragenter", "dragover"].forEach(function(eventName) {
                    dropZone.addEventListener(eventName, function(event) {
                        event.preventDefault();
                        dropZone.classList.add("drag-over");
                    });
                });

                ["dragleave", "drop"].forEach(function(eventName) {
                    dropZone.addEventListener(eventName, function(event) {
                        event.preventDefault();
                        dropZone.classList.remove("drag-over");
                    });
                });

                dropZone.addEventListener("drop", function(event) {
                    try {
                        var dragEvent = /** @type {DragEvent} */ (event);
                        if (dragEvent.dataTransfer && dragEvent.dataTransfer.files) {
                            fileHandler.addFiles(dragEvent.dataTransfer.files);
                            renderSelectedFiles();
                            hideError();
                        }
                    } catch (error) {
                        showError(error);
                    }
                });
            }

            if (selectedFilesList) {
                selectedFilesList.addEventListener("click", function(event) {
                    try {
                        var target = /** @type {HTMLElement} */ (event.target);
                        if (target.matches(".remove-btn")) {
                            var index = Number(target.getAttribute("data-index"));
                            fileHandler.removeFile(index);
                            renderSelectedFiles();
                        }
                    } catch (error) {
                        showError(error);
                    }
                });
            }

            if (clearBtn) {
                clearBtn.addEventListener("click", function() {
                    fileHandler.clearFiles();
                    renderSelectedFiles();
                    hideError();
                    showSuccess("Selection cleared.");
                });
            }

            if (compressBtn) {
                compressBtn.addEventListener("click", handleCompress);
            }

            if (openZipBtn && zipInput) {
                openZipBtn.addEventListener("click", function() {
                    zipInput.click();
                });

                zipInput.addEventListener("change", handleOpenZip);
            }

            if (extractAllBtn) {
                extractAllBtn.addEventListener("click", handleExtractAll);
            }

            if (themeToggle) {
                themeToggle.addEventListener("click", toggleTheme);
            }

            if (shareBtn) {
                shareBtn.addEventListener("click", handleShareZip);
            }
        }

        /**
         * Compresses selected files into ZIP and triggers download.
         * @returns {Promise<void>} Completes after ZIP generation flow finishes.
         */
        async function handleCompress() {
            try {
                hideError();
                hideSuccess();
                setLoadingState(true);
                setProgress(0);

                var files = fileHandler.getFiles();
                var name = outputName ? outputName.value : "zipdrop-archive";

                var result = await compressionService.compressFiles(files, name, function(percent) {
                    setProgress(percent);
                });

                latestZipBlob = result.blob;
                latestZipName = result.zipName;

                compressionService.downloadBlob(result.blob, result.zipName);
                updateCompressionStats(result.originalSize, result.compressedSize, result.zipName);

                if (shareBtn) {
                    shareBtn.disabled = false;
                }

                showSuccess("Compression complete. ZIP downloaded successfully.");
            } catch (error) {
                showError(error);
            } finally {
                setLoadingState(false);
            }
        }

        /**
         * Opens and previews a selected ZIP file.
         * @param {Event} event - Input change event.
         * @returns {Promise<void>} Completes after ZIP parsing.
         */
        async function handleOpenZip(event) {
            try {
                hideError();
                hideSuccess();

                var target = /** @type {HTMLInputElement} */ (event.target);
                var zipFile = target.files && target.files[0];

                var parsed = await compressionService.parseZipFile(zipFile || null);
                openedZip = parsed.zip;
                fileHandler.setZipEntries(parsed.entries);
                renderZipEntries(parsed.entries);

                if (extractAllBtn) {
                    extractAllBtn.disabled = parsed.entries.length === 0;
                }

                showSuccess("ZIP opened successfully. " + parsed.entries.length + " file(s) found.");
                target.value = "";
            } catch (error) {
                showError(error);
            }
        }

        /**
         * Extracts and downloads all entries from opened ZIP.
         * @returns {Promise<void>} Completes once extraction loop finishes.
         */
        async function handleExtractAll() {
            try {
                hideError();
                hideSuccess();

                if (!openedZip) {
                    throw new Error("Open a ZIP file before extracting.");
                }

                setLoadingState(true);
                await compressionService.extractAllEntries(openedZip, function() {
                    return;
                });
                showSuccess("Extracted all files. Individual downloads should begin automatically.");
            } catch (error) {
                showError(error);
            } finally {
                setLoadingState(false);
            }
        }

        /**
         * Shares the latest generated ZIP via Web Share API.
         * @returns {Promise<void>} Completes after share attempt.
         */
        async function handleShareZip() {
            try {
                hideError();
                hideSuccess();

                if (!latestZipBlob || !latestZipName) {
                    throw new Error("Create a ZIP first, then use Share ZIP.");
                }

                var shared = await compressionService.shareZip(latestZipBlob, latestZipName);
                if (!shared) {
                    throw new Error("Sharing is not available on this browser/device.");
                }

                showSuccess("ZIP shared successfully.");
            } catch (error) {
                showError(error);
            }
        }

        /**
         * Renders selected file cards and summary stats.
         */
        function renderSelectedFiles() {
            if (!selectedFilesList || !fileCount || !totalSize || !compressBtn || !clearBtn) {
                return;
            }

            var files = fileHandler.getFiles();
            selectedFilesList.innerHTML = "";

            files.forEach(function(file, index) {
                var item = document.createElement("li");
                item.className = "file-card";

                var meta = document.createElement("div");
                meta.className = "file-meta";

                var name = document.createElement("span");
                name.className = "file-name";
                name.textContent = file.name;

                var size = document.createElement("span");
                size.className = "file-size";
                size.textContent = formatBytes(file.size);

                meta.appendChild(name);
                meta.appendChild(size);

                var removeButton = document.createElement("button");
                removeButton.type = "button";
                removeButton.className = "remove-btn";
                removeButton.setAttribute("aria-label", "Remove " + file.name);
                removeButton.setAttribute("data-index", String(index));
                removeButton.textContent = "×";

                item.appendChild(meta);
                item.appendChild(removeButton);
                selectedFilesList.appendChild(item);
            });

            fileCount.textContent = files.length + " file" + (files.length === 1 ? "" : "s");
            totalSize.textContent = formatBytes(fileHandler.getTotalSize());

            var hasFiles = files.length > 0;
            compressBtn.disabled = !hasFiles;
            clearBtn.disabled = !hasFiles;
        }

        /**
         * Renders the list of entries found in opened ZIP.
         * @param {Array<{name: string, size: number}>} entries - ZIP entry metadata.
         */
        function renderZipEntries(entries) {
            if (!zipEntriesList) {
                return;
            }

            zipEntriesList.innerHTML = "";

            entries.forEach(function(entry) {
                var item = document.createElement("li");
                item.className = "file-card";

                var meta = document.createElement("div");
                meta.className = "file-meta";

                var name = document.createElement("span");
                name.className = "file-name";
                name.textContent = entry.name;

                var size = document.createElement("span");
                size.className = "file-size";
                size.textContent = formatBytes(entry.size);

                meta.appendChild(name);
                meta.appendChild(size);

                item.appendChild(meta);
                zipEntriesList.appendChild(item);
            });
        }

        /**
         * Updates compression stats card.
         * @param {number} inputSize - Original bytes.
         * @param {number} outputSize - ZIP bytes.
         * @param {string} archiveName - Output filename.
         */
        function updateCompressionStats(inputSize, outputSize, archiveName) {
            if (!compressionStats || !originalSize || !zipSize || !savedPercent || !zipFileName) {
                return;
            }

            var saved = inputSize > 0 ? ((inputSize - outputSize) / inputSize) * 100 : 0;

            compressionStats.classList.remove("hidden");
            originalSize.textContent = formatBytes(inputSize);
            zipSize.textContent = formatBytes(outputSize);
            savedPercent.textContent = saved.toFixed(2) + "%";
            zipFileName.textContent = archiveName;
        }

        /**
         * Sets progress UI value.
         * @param {number} percent - Progress percentage.
         */
        function setProgress(percent) {
            var clamped = Math.max(0, Math.min(100, Number(percent) || 0));
            if (progressBar) {
                progressBar.style.width = clamped + "%";
            }
            if (progressText) {
                progressText.textContent = clamped + "%";
            }
        }

        /**
         * Applies loading/disabled state during async actions.
         * @param {boolean} isLoading - True while processing.
         */
        function setLoadingState(isLoading) {
            if (compressBtn) {
                compressBtn.disabled = isLoading || fileHandler.getFiles().length === 0;
            }
            if (clearBtn) {
                clearBtn.disabled = isLoading || fileHandler.getFiles().length === 0;
            }
            if (openZipBtn) {
                openZipBtn.disabled = isLoading;
            }
            if (extractAllBtn) {
                extractAllBtn.disabled = isLoading || fileHandler.getZipEntries().length === 0;
            }
            if (shareBtn) {
                shareBtn.disabled = isLoading || !latestZipBlob;
            }
        }

        /**
         * Displays an error message banner.
         * @param {unknown} error - Error object or string.
         */
        function showError(error) {
            if (!errorBanner) {
                return;
            }
            var message = error instanceof Error ? error.message : String(error || "Unknown error");
            errorBanner.textContent = message;
            errorBanner.classList.remove("hidden");
            hideSuccess();
        }

        /**
         * Hides error banner.
         */
        function hideError() {
            if (!errorBanner) {
                return;
            }
            errorBanner.textContent = "";
            errorBanner.classList.add("hidden");
        }

        /**
         * Displays a success message banner.
         * @param {string} message - Success message.
         */
        function showSuccess(message) {
            if (!successBanner) {
                return;
            }
            successBanner.textContent = message;
            successBanner.classList.remove("hidden");
        }

        /**
         * Hides success banner.
         */
        function hideSuccess() {
            if (!successBanner) {
                return;
            }
            successBanner.textContent = "";
            successBanner.classList.add("hidden");
        }

        /**
         * Formats bytes into readable size units.
         * @param {number} bytes - Raw byte count.
         * @returns {string} Human-readable size.
         */
        function formatBytes(bytes) {
            if (!bytes || bytes < 0) {
                return "0 B";
            }

            var units = ["B", "KB", "MB", "GB"];
            var index = Math.floor(Math.log(bytes) / Math.log(1024));
            var safeIndex = Math.min(index, units.length - 1);
            var size = bytes / Math.pow(1024, safeIndex);
            return size.toFixed(safeIndex === 0 ? 0 : 2) + " " + units[safeIndex];
        }

        /**
         * Applies previously selected theme from localStorage.
         */
        function applySavedTheme() {
            var root = document.documentElement;
            var storedTheme = localStorage.getItem("zipdrop-theme");
            var theme = storedTheme === "dark" ? "dark" : "light";
            root.setAttribute("data-theme", theme);
            updateThemeButtonLabel(theme);
        }

        /**
         * Toggles color theme and persists it.
         */
        function toggleTheme() {
            var root = document.documentElement;
            var current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
            var next = current === "dark" ? "light" : "dark";
            root.setAttribute("data-theme", next);
            localStorage.setItem("zipdrop-theme", next);
            updateThemeButtonLabel(next);
        }

        /**
         * Updates theme toggle button text.
         * @param {string} theme - Active theme key.
         */
        function updateThemeButtonLabel(theme) {
            if (!themeToggle) {
                return;
            }
            themeToggle.textContent = theme === "dark" ? "Switch to Light" : "Switch to Dark";
        }

        return {
            init: init
        };
    })();

    uiController.init();
})();