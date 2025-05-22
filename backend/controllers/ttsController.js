const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const { v4: uuidv4 } = require('uuid');
const say = require('say');

const uploadsDir = path.join(__dirname, '../uploads');

// Ensure uploads folder exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// macOS/Linux TTS using say.export()
async function speakTextUnix(text, filePath) {
  return new Promise((resolve, reject) => {
    say.export(text, null, 1.0, filePath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Windows TTS using PowerShell to generate WAV
async function speakTextWindows(text, filePath) {
  // Escape single quotes in text for PowerShell
  const escapedText = text.replace(/'/g, "''");
  // Replace backslashes for PowerShell
  const psFilePath = filePath.replace(/\\/g, '\\\\');

  const psCommand = `
    Add-Type -AssemblyName System.speech;
    $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;
    $speak.SetOutputToWaveFile('${psFilePath}');
    $speak.Speak('${escapedText}');
    $speak.Dispose();
  `;

  await execPromise(`powershell -Command "${psCommand}"`);
}

// Main controller
exports.speakText = async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required for speech synthesis.' });
  }

  const filename = `${uuidv4()}.wav`;
  const filePath = path.join(uploadsDir, filename);

  try {
    if (os.platform() === 'win32') {
      // Windows TTS
      await speakTextWindows(text, filePath);
    } else {
      // macOS/Linux TTS
      await speakTextUnix(text, filePath);
    }

    // Send relative URL to frontend for playback
    res.status(200).json({ audioUrl: `/uploads/${filename}` });
  } catch (error) {
    console.error('speakText Error:', error);
    res.status(500).json({ error: 'Failed to synthesize speech.' });
  }
};
