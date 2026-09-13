import math
import wave

sample_rate = 8000
frames = bytearray()
for i in range(sample_rate):
    sample = int(12000 * math.sin(2 * math.pi * 220 * i / sample_rate))
    frames += int(sample).to_bytes(2, "little", signed=True)
with wave.open("test-tone.wav", "wb") as output:
    output.setnchannels(1)
    output.setsampwidth(2)
    output.setframerate(sample_rate)
    output.writeframes(frames)
