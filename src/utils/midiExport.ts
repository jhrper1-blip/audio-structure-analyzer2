import MidiWriter from 'midi-writer-js';
import JSZip from 'jszip';

export interface StructureSection {
  label: string;
  start_time: number;
  end_time: number;
}

export interface AnalysisResult {
  tempo: number;
  structure: StructureSection[];
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function createMarkerTrack(result: AnalysisResult): Uint8Array {
  const track = new MidiWriter.Track();
  track.setTempo(result.tempo);
  track.setTimeSignature(4, 4);

  const ticksPerSecond = (480 * result.tempo) / 60;

  result.structure.forEach((section, index) => {
    const startTicks = Math.round(section.start_time * ticksPerSecond);

    track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 }));
    track.addEvent(new MidiWriter.MetaEvent({
      type: 'marker',
      data: `${section.label} (${formatTime(section.start_time)})`,
      tick: startTicks
    }));
  });

  const writer = new MidiWriter.Writer([track]);
  return new Uint8Array(writer.buildFile());
}

function createInstrumentTrack(instrument: string, tempo: number): Uint8Array {
  const track = new MidiWriter.Track();
  track.setTempo(tempo);
  track.setTimeSignature(4, 4);

  const note = new MidiWriter.NoteEvent({
    pitch: ['C4'],
    duration: '1',
    repeat: 4,
    velocity: 50
  });

  track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 }));
  track.addEvent(note, function(event, index) {
    return { sequential: true };
  });

  const writer = new MidiWriter.Writer([track]);
  return new Uint8Array(writer.buildFile());
}

export async function exportAbletonTemplateZip(result: AnalysisResult, originalFilename: string): Promise<void> {
  try {
    const zip = new JSZip();

    // Create folders and files inside the zip
    zip.file('README.txt', 'This zip contains MIDI tracks and markers for your Ableton template.');

    zip.folder('markers')?.file('structure_markers.mid', createMarkerTrack(result));
    zip.folder('tracks')?.file('drums.mid', createInstrumentTrack('drums', result.tempo));
    zip.folder('tracks')?.file('bass.mid', createInstrumentTrack('bass', result.tempo));
    zip.folder('tracks')?.file('synth.mid', createInstrumentTrack('synth', result.tempo));
    zip.folder('tracks')?.file('keys.mid', createInstrumentTrack('keys', result.tempo));

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);

    const baseName = originalFilename.replace(/\.[^/.]+$/, '');
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseName}_ableton_template.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('❌ Failed to create Ableton ZIP:', err);
    throw new Error('Could not export Ableton project ZIP.');
  }
}