export interface StructureSection {
  label: string;
  start_time: number;
  end_time: number;
}

export interface AnalysisResult {
  tempo: number;
  structure: StructureSection[];
}

/**
 * Dynamically loads the MIDI Writer library from CDN
 */
export function loadMidiWriter(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).MidiWriter) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/midi-writer-js@2.0.5/build/index.js';
    script.onload = () => {
      if ((window as any).MidiWriter) {
        console.log('✅ MIDI Writer loaded!');
        resolve();
      } else {
        reject(new Error('Script loaded but MIDI Writer not found on window.'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load MIDI Writer library.'));
    document.head.appendChild(script);
  });
}

/**
 * Creates a MIDI file with structure markers
 */
export function createMidiFile(result: AnalysisResult, filename: string): Blob {
  const MidiWriter = (window as any).MidiWriter;
  if (!MidiWriter) {
    throw new Error('MIDI Writer library not loaded');
  }

  const track = new MidiWriter.Track();
  track.setTempo(result.tempo);
  track.setTimeSignature(4, 4);

  const ticksPerSecond = (480 * result.tempo) / 60;

  result.structure.forEach((section, index) => {
    const startTicks = Math.round(section.start_time * ticksPerSecond);

    track.addEvent(new MidiWriter.MetaEvent({
      type: 'marker',
      data: `${section.label} (${formatTime(section.start_time)})`,
      tick: startTicks
    }));

    track.addEvent(new MidiWriter.MetaEvent({
      type: 'text',
      data: `Section ${index + 1}: ${section.label} - Duration: ${formatTime(section.end_time - section.start_time)}`,
      tick: startTicks
    }));
  });

  // Add final marker
  const last = result.structure[result.structure.length - 1];
  const endTicks = Math.round(last.end_time * ticksPerSecond);
  track.addEvent(new MidiWriter.MetaEvent({
    type: 'marker',
    data: `End (${formatTime(last.end_time)})`,
    tick: endTicks
  }));

  const write = new MidiWriter.Writer(track);
  const midiData = write.buildFile();
  const uint8Array = new Uint8Array(midiData);
  return new Blob([uint8Array], { type: 'audio/midi' });
}

/**
 * Triggers the download of the MIDI file
 */
export function downloadMidiFile(result: AnalysisResult, originalFilename: string): void {
  try {
    const midiBlob = createMidiFile(result, originalFilename);
    const url = URL.createObjectURL(midiBlob);
    const link = document.createElement('a');

    const baseName = originalFilename.replace(/\.[^/.]+$/, '');
    link.href = url;
    link.download = `${baseName}_structure_markers.mid`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('❌ MIDI export failed:', error);
    throw new Error('Failed to export MIDI file. Please try again.');
  }
}

/**
 * Format time in MM:SS
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}