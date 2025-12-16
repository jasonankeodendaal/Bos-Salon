// utils/mediaOptimizer.ts

const MAX_DIMENSION = 1280; // Target 720p on the longest side
const TARGET_BITRATE = 2 * 1024 * 1024; // 2 Mbps

/**
 * Compresses a video file using the MediaRecorder API.
 * @param videoFile The video file to compress.
 * @param onProgress A callback to report compression progress (0 to 1).
 * @returns A Promise that resolves with the compressed video file as a .webm file.
 */
export const compressVideo = (videoFile: File, onProgress?: (progress: number) => void): Promise<File> => {
    return new Promise((resolve, reject) => {
        if (!videoFile.type.startsWith('video/')) {
            return reject(new Error('File is not a video.'));
        }

        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(videoFile);
        video.muted = true;

        video.onloadedmetadata = () => {
            const { videoWidth, videoHeight } = video;

            let targetWidth = videoWidth;
            let targetHeight = videoHeight;

            // Calculate new dimensions while preserving aspect ratio if larger than max dimension
            if (videoWidth > MAX_DIMENSION || videoHeight > MAX_DIMENSION) {
                if (videoWidth > videoHeight) {
                    targetWidth = MAX_DIMENSION;
                    targetHeight = Math.round((MAX_DIMENSION / videoWidth) * videoHeight);
                } else {
                    targetHeight = MAX_DIMENSION;
                    targetWidth = Math.round((MAX_DIMENSION / videoHeight) * videoWidth);
                }
            }
            
            // Ensure dimensions are even numbers for codec compatibility
            targetWidth = targetWidth % 2 === 0 ? targetWidth : targetWidth - 1;
            targetHeight = targetHeight % 2 === 0 ? targetHeight : targetHeight - 1;

            video.width = targetWidth;
            video.height = targetHeight;

            const stream = (video as any).captureStream();
            
            if (typeof MediaRecorder === 'undefined') {
                console.warn('MediaRecorder API not supported. Uploading original file.');
                resolve(videoFile);
                return;
            }

            const recorder = new MediaRecorder(stream, {
                mimeType: 'video/webm; codecs=vp9',
                videoBitsPerSecond: TARGET_BITRATE,
            });

            const chunks: Blob[] = [];
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            recorder.onstop = () => {
                const compressedBlob = new Blob(chunks, { type: 'video/webm' });
                const compressedFile = new File([compressedBlob], `compressed_${videoFile.name.split('.')[0]}.webm`, {
                    type: 'video/webm',
                });
                URL.revokeObjectURL(video.src);
                resolve(compressedFile);
            };
            
            recorder.onerror = (event) => {
                console.error('MediaRecorder error:', event);
                URL.revokeObjectURL(video.src);
                reject(new Error('Video compression failed.'));
            };

            video.onplay = () => {
                recorder.start();
            };
            
            video.onended = () => {
                // Some browsers may not fire onended when playing from a blob URL this way.
                // Stop is primarily called from the timeupdate check.
                if (recorder.state === 'recording') {
                   recorder.stop();
                }
            };
            
            if (onProgress) {
                video.ontimeupdate = () => {
                    if (video.duration) {
                        const progress = video.currentTime / video.duration;
                        onProgress(progress);
                        // Stop recorder when video is fully processed
                        if (progress >= 1 && recorder.state === 'recording') {
                            recorder.stop();
                        }
                    }
                };
            }

            video.play().catch(e => {
                console.error("Video play error during compression:", e);
                // Fallback for browsers that block autoplay
                if (recorder.state !== 'recording') {
                   recorder.start();
                   setTimeout(() => {
                       if (recorder.state === 'recording') recorder.stop();
                   }, video.duration * 1000);
                }
            });
        };

        video.onerror = (e) => {
            console.error("Error loading video for compression:", e);
            URL.revokeObjectURL(video.src);
            reject(new Error('Failed to load video file for compression.'));
        };
    });
};
