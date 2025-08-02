import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { AnalysisResult } from './midiExport';

export async function exportAbletonTemplateZip(result: AnalysisResult, filename: string) {
  const zip = new JSZip();

  const tracks = ['Drums', 'Bass', 'Synth', 'Vocals'];
  tracks.forEach((track) => {
    zip.file(`AbletonProject/${track}.txt`, `Placeholder for ${track} track`);
  });

  const structureText = result.structure
    .map(
      (s, i) =>
        `${i + 1}. ${s.label}: ${s.start_time.toFixed(1)}s – ${s.end_time.toFixed(1)}s`
    )
    .join('\n');

  zip.file(`AbletonProject/structure_markers.txt`, structureText);

  const blob = await zip.generateAsync({ type: 'blob' });
  const baseName = filename.replace(/\.[^/.]+$/, '');
  saveAs(blob, `${baseName}_ableton_template.zip`);
}