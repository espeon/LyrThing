import {JLF, SyncedLines, SyncedMetadata} from "../src/types/lyrics";

export default function lrcToJlf(lrcContent: string, metadata: SyncedMetadata, source = "LRCLib") {
    const lines = lrcContent.split('\n');
    const syncedLines: SyncedLines = {
        lines: [],
        linesEnd: 0,
    };

    // Process each line in the LRC
    lines.forEach(line => {
        const timeMatch = line.match(/\[(\d{2}):(\d{2}\.\d{2})\]/); // Matches [mm:ss.xx]
        if (timeMatch) {
            const minutes = parseInt(timeMatch[1], 10);
            const seconds = parseFloat(timeMatch[2]);
            const timeInMs = (minutes * 60 + seconds) * 1000; // Convert to milliseconds
            
            const text = line.replace(/\[\d{2}:\d{2}\.\d{2}\]/, '').trim(); // Remove timestamp

            // Add the synced line to the array
            syncedLines.lines.push({
                time: timeInMs,
                text: text,
            });

            // Update linesEnd if this is the last line
            syncedLines.linesEnd = Math.max(syncedLines.linesEnd, timeInMs);
        }
    });

    // Construct the JLF object
    const jlf: JLF = {
        lines: syncedLines,
        source: source,
        metadata: metadata
    };

    return jlf;
}
