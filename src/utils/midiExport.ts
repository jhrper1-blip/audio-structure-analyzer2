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

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function createInstrumentTrack(name: string, tempo: number, structure: StructureSection[], channel: number) {
  const track = new MidiWriter.Track();
  track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1, channel }));
  const ticksPerSecond = (480 * tempo) / 60;

  structure.forEach((section, i) => {
    const startTicks = Math.round(section.start_time * ticksPerSecond);
    const noteDuration = '1'; // Placeholder for demo
    track.addEvent(
      new MidiWriter.NoteEvent({
        pitch: ['C4'],
        duration: noteDuration,
        startTick: startTicks,
        channel,
        velocity: 70,
      })
    );
  });

  return track;
}

function createMarkerTrack(tempo: number, structure: StructureSection[]) {
  const track = new MidiWriter.Track();
  track.setTempo(tempo);
  track.setTimeSignature(4, 4);

  const ticksPerSecond = (480 * tempo) / 60;

  structure.forEach((section, index) => {
    const startTicks = Math.round(section.start_time * ticksPerSecond);

    track.addEvent(
      new MidiWriter.TextEvent({
        text: `${section.label} (${formatTime(section.start_time)})`,
        tick: startTicks,
      })
    );
  });

  return track;
}

export function createMidiTemplate(result: AnalysisResult): Blob {
  const markerTrack = createMarkerTrack(result.tempo, result.structure);

  const instrumentTracks = [
    createInstrumentTrack('Drums', result.tempo, result.structure, 9),
    createInstrumentTrack('Bass', result.tempo, result.structure, 1),
    createInstrumentTrack('Synth', result.tempo, result.structure, 2),
    createInstrumentTrack('Keys', result.tempo, result.structure, 3),
  ];

  const writer = new MidiWriter.Writer([markerTrack, ...instrumentTracks]);
  const midiData = writer.buildFile();
  const uint8Array = new Uint8Array(midiData);

  return new Blob([uint8Array], { type: 'audio/midi' });
}

export function downloadMidiFile(result: AnalysisResult, originalFilename: string): void {
  try {
    const midiBlob = createMidiTemplate(result);
    const url = URL.createObjectURL(midiBlob);
    const link = document.createElement('a');
    const baseName = originalFilename.replace(/\.[^/.]+$/, '');
    link.href = url;
    link.download = `${baseName}_ableton_template.mid`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('❌ MIDI export failed:', error);
    throw new Error('Failed to export MIDI template.');
  }
}