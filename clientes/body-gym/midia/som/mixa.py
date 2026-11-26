# Mixa camadas de efeitos Mixkit alinhando os picos; saída em midia/som/<nome>.mp3 com o pico em PICO s.
import subprocess, numpy as np, os
S = os.path.dirname(os.path.abspath(__file__)) + '/'
D = '/home/user/sites-cinema/clientes/body-gym/midia/som/'

def pico(f):
    a = np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',S+f,'-ac','1','-ar','22050','-f','s16le','-'],capture_output=True).stdout,np.int16).astype(float)
    env = np.sqrt(np.convolve(a*a, np.ones(220)/220, 'same')); return env.argmax()/22050

MIX = {
  'alem':    ([('2980.mp3',1.0),('546.mp3',.75)], 2.4),
  'deum':    ([('2775.mp3',.95),('563.mp3',.7)], 2.0),
  'simples': ([('785.mp3',.9),('551.mp3',.8)], 2.8),
  'treino':  ([('2609.mp3',1.0),('3111.mp3',.9),('783.mp3',.8)], 3.6),
  'marca':   ([('2908.mp3',1.0),('775.mp3',.7)], 3.4),
}
saida = {}
for nome,(camadas,dur) in MIX.items():
    pk = [pico(f) for f,_ in camadas]; P = max(pk)
    cmd = ['ffmpeg','-v','error','-y']
    for f,_ in camadas: cmd += ['-i', S+f]
    fil = ''.join('[%d]aresample=44100,pan=mono|c0=0.5*c0+0.5*c1,adelay=%d,volume=%.2f[a%d];' % (i, round((P-p)*1000), g, i) if True else '' for i,((f,g),p) in enumerate(zip(camadas,pk)))
    fil += ''.join('[a%d]' % i for i in range(len(camadas))) + 'amix=inputs=%d:normalize=0,atrim=0:%.2f,afade=t=out:st=%.2f:d=%.2f,alimiter=limit=0.95[o]' % (len(camadas), dur, dur*.45, dur*.55)
    cmd += ['-filter_complex', fil, '-map', '[o]', '-ac','1','-ar','44100','-codec:a','libmp3lame','-b:a','128k', D+nome+'.mp3']
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print(nome, r.stderr[-400:]); continue
    a = np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',D+nome+'.mp3','-ac','1','-ar','22050','-f','s16le','-'],capture_output=True).stdout,np.int16).astype(float)
    env = np.sqrt(np.convolve(a*a, np.ones(220)/220, 'same'))
    print(nome, 'pico=%.3f' % (env.argmax()/22050), 'picos camadas', [round(x,3) for x in pk], 'P=%.3f' % P)
