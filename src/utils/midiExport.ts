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

export function createMidiFile(result: AnalysisResult, filename: string): Blob {
  const track = new MidiWriter.Track();
  track.setTempo(result.tempo);
  track.setTimeSignature(4, 4);

  const ticksPerSecond = (480 * result.tempo) / 60;

  result.structure.forEach((section, index) => {
    const startTicks = Math.round(section.start_time * ticksPerSecond);

    track.addMarker(
      `${section.label} (${formatTime(section.start_time)})`,
      { tick: startTicks }
    );

    track.addText(
      `Section ${index + 1}: ${section.label} - Duration: ${formatTime(section.end_time - section.start_time)}`,
      { tick: startTicks }
    );
  });

  const last = result.structure[result.structure.length - 1];
  const endTicks = Math.round(last.end_time * ticksPerSecond);

  track.addMarker(`End (${formatTime(last.end_time)})`, { tick: endTicks });

  const write = new MidiWriter.Writer(track);
  const midiData = write.buildFile();
  const uint8Array = new Uint8Array(midiData);

  return new Blob([uint8Array], { type: 'audio/midi' });
}

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

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}