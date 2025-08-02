interface StructureSection {
  label: string;
  start_time: number;
  end_time: number;
}

interface AnalysisResult {
  tempo: number;
  structure: StructureSection[];
}

const TICKS_PER_QUARTER = 480;

/**
 * Converts analysis results to a MIDI file with labeled structure markers.
 * @param result Analysis result containing tempo and structure
 * @param filename Original audio filename (used for naming)
 * @returns Blob representing the MIDI file
 */
export function createMidiFile(result: AnalysisResult, filename: string): Blob {
  const MidiWriter = (window as any).MidiWriter;

  if (!MidiWriter) {
    throw new Error('MIDI Writer library not loaded');
  }

  if (!result.structure || result.structure.length === 0) {
    throw new Error('No structure data found in analysis result.');
  }

  const track = new MidiWriter.Track();

  // Optional: Name the track
  track.addEvent(
    new MidiWriter.MetaEvent({
      type: 'trackName',
      data: `${filename.replace(/\.[^/.]+$/, '')} Structure`
    })
  );

  // Set tempo and default time signature (4/4)
  track.setTempo(result.tempo);
  track.setTimeSignature(4, 4);

  const ticksPerSecond = (TICKS_PER_QUARTER * result.tempo) / 60;

  result.structure.forEach((section, index) => {
    const startTicks = Math.round(section.start_time * ticksPerSecond);

    // Add marker event for DAW arrangement
    track.addEvent(
      new MidiWriter.MetaEvent({
        type: 'marker',
        data: `${section.label} (${formatTime(section.start_time)})`,
        tick: startTicks
      })
    );

    // Optional: Add text event with details
    track.addEvent(
      new MidiWriter.MetaEvent({
        type: 'text',
        data: `Section ${index + 1}: ${section.label} – Duration: ${formatTime(section.end_time - section.start_time)}`,
        tick: startTicks
      })
    );
  });

  // Add final marker at the end of the last section
  const lastSection = result.structure[result.structure.length - 1];
  const endTicks = Math.round(lastSection.end_time * ticksPerSecond);

  track.addEvent(
    new MidiWriter.MetaEvent({
      type: 'marker',
      data: `End (${formatTime(lastSection.end_time)})`,
      tick: endTicks
    })
  );

  const writer = new MidiWriter.Writer(track);
  const midiData = writer.buildFile();
  const uint8Array = new Uint8Array(midiData);

  return new Blob([uint8Array], { type: 'audio/midi' });
}

/**
 * Triggers download of the generated MIDI file.
 * @param result Audio structure analysis result
 * @param originalFilename Name of the original uploaded audio file
 */
export function downloadMidiFile(result: AnalysisResult, originalFilename: string): void {
  try {
    const midiBlob = createMidiFile(result, originalFilename);
    const url = URL.createObjectURL(midiBlob);
    const link = document.createElement('a');

    const baseName = originalFilename.replace(/\.[^/.]+$/, '');
    const safeName = baseName.replace(/[^a-z0-9_-]/gi, '_');

    link.href = url;
    link.download = `${safeName}_structure_markers.mid`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to create MIDI file:', error);
    throw new Error('Failed to export MIDI file. Please try again.');
  }
}

/**
 * Converts seconds to MM:SS format.
 * @param seconds Number of seconds
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Loads the MIDI Writer library from CDN if not already loaded.
 */
export function loadMidiWriter(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).MidiWriter) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/midi-writer-js@2.0.5/build/index.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load MIDI Writer library'));
    document.head.appendChild(script);
  });
}