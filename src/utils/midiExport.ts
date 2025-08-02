import MidiWriter from 'midi-writer-js';

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
 * Utility: format seconds into mm:ss
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Creates a MIDI file with marker events for each section.
 * Optionally adds a track label (for Ableton exports).
 */
export function createMidiTemplate(result: AnalysisResult, trackLabel?: string): Blob {
  const track = new MidiWriter.Track();
  track.setTempo(result.tempo);
  track.setTimeSignature(4, 4);

  const ticksPerSecond = (480 * result.tempo) / 60;

  result.structure.forEach((section, index) => {
    const startTicks = Math.round(section.start_time * ticksPerSecond);
    const label = trackLabel ? `${trackLabel}: ${section.label}` : section.label;

    track.addEvent(new MidiWriter.MetaEvent({
      type: 'marker',
      data: `${label} (${formatTime(section.start_time)})`,
      tick: startTicks
    }));

    track.addEvent(new MidiWriter.MetaEvent({
      type: 'text',
      data: `Section ${index + 1}: ${label} - Duration: ${formatTime(section.end_time - section.start_time)}`,
      tick: startTicks
    }));
  });

  const last = result.structure[result.structure.length - 1];
  const endTicks = Math.round(last.end_time * ticksPerSecond);

  track.addEvent(new MidiWriter.MetaEvent({
    type: 'marker',
    data: `End (${formatTime(last.end_time)})`,
    tick: endTicks
  }));

  const writer = new MidiWriter.Writer([track]);
  return new Blob([new Uint8Array(writer.buildFile())], { type: 'audio/midi' });
}

/**
 * Triggers a download of a single structure MIDI file
 */
export function downloadMidiFile(result: AnalysisResult, originalFilename: string): void {
  try {
    const midiBlob = createMidiTemplate(result);
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
    throw new Error('Failed to export MIDI file.');
  }
}