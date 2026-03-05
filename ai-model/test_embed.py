import requests, io, glob

imgs = glob.glob('dataset/found/item_*.jpg') + glob.glob('dataset/found/bag_*.jpg')
if not imgs:
    print('No images found')
else:
    path = imgs[0]
    print(f'Testing with: {path}')
    with open(path, 'rb') as f:
        data = f.read()
    files = {'image': ('test.jpg', io.BytesIO(data), 'image/jpeg')}
    r = requests.post('http://localhost:8000/embed', files=files, timeout=30)
    print(f'Status: {r.status_code}')
    if r.status_code == 200:
        j = r.json()
        print(f"Models: {j.get('models_used')}")
        print(f"Embedding dim: {len(j.get('embedding', []))}")
    else:
        print(f'Error: {r.text[:300]}')
