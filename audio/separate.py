"""Split a video's audio into voice / drums / bass / other with HTDemucs (safetensors weights, no pickle).

Usage:
    /root/voiceover/.venv/bin/python audio/separate.py input.wav out_dir [--model DIR]

Writes out_dir/{vocals,drums,bass,other,no_vocals}.wav (44.1 kHz stereo).
Weights: HTDemucs (MIT, Facebook Research) converted to safetensors:
https://huggingface.co/AEmotionStudio/htdemucs-models
"""
import argparse
import json
import os

import numpy as np
import soundfile as sf
import torch
from safetensors.torch import load_file
from demucs.htdemucs import HTDemucs
from demucs.apply import apply_model


def load_model(model_dir):
    cfg = json.load(open(os.path.join(model_dir, 'htdemucs_config.json')))
    model = HTDemucs(*cfg['args'], **cfg['kwargs'])
    sd = load_file(os.path.join(model_dir, 'htdemucs.safetensors'))
    sd = {k[len('state.'):] if k.startswith('state.') else k: v for k, v in sd.items()}
    model.load_state_dict(sd)
    model.eval()
    return model


def read_44k_stereo(path):
    x, sr = sf.read(path, always_2d=True)
    if x.shape[1] == 1:
        x = np.repeat(x, 2, axis=1)
    if sr != 44100:
        import torchaudio.functional as F
        x = F.resample(torch.from_numpy(x.T.copy()).float(), sr, 44100).numpy().T
    return x.astype(np.float32)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('input')
    ap.add_argument('out_dir')
    ap.add_argument('--model', default='/root/voiceover/demucs-models')
    a = ap.parse_args()
    os.makedirs(a.out_dir, exist_ok=True)
    torch.set_num_threads(os.cpu_count() or 4)
    model = load_model(a.model)
    x = read_44k_stereo(a.input)
    wav = torch.from_numpy(x.T.copy())
    ref = wav.mean(0)
    mean, std = ref.mean(), ref.std() + 1e-8
    with torch.no_grad():
        out = apply_model(model, ((wav - mean) / std)[None], device='cpu', split=True, overlap=0.25, progress=True)[0]
    out = out * std + mean
    stems = {name: out[i].numpy().T for i, name in enumerate(model.sources)}
    for name, s in stems.items():
        sf.write(os.path.join(a.out_dir, f'{name}.wav'), s, 44100)
    sf.write(os.path.join(a.out_dir, 'no_vocals.wav'), sum(v for k, v in stems.items() if k != 'vocals'), 44100)
    print('wrote', a.out_dir, list(stems))


if __name__ == '__main__':
    main()
