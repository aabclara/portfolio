"""
Converte as imagens de assets/projetos26 em cópias WebP otimizadas,
com nomes seguros para URL (sem acentos/espaços) e numeradas por ordem.

Originais NÃO são alterados. Saída: assets/img/projetos/<slug>/NN-nome.webp
Também gera assets/img/projetos/manifest.json (lista por projeto).

Uso: python scripts/otimizar_imagens.py
"""
import json
import re
import shutil
import unicodedata
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ORIGEM = RAIZ / "assets" / "projetos26"
DESTINO = RAIZ / "assets" / "img" / "projetos"

LARGURA_MAX = 1400   # px
QUALIDADE = 82       # WebP

# pasta original -> slug de destino (agrupamento do site)
MAPA = {
    "SITE": "site-2024",
    "NEXUS": "chapa-nexus",
    "CFAC_Posts": "cardoso-freire-posts",
    "FEEDBACK - Lab. Claudino": "cardoso-freire-posts",
    "CFAC Papelaria": "cardoso-freire-papelaria",
    "COD3": "cod3beer",
    "CONECTI": "conecti",
    "[FMARINI] Manual de Cultura [V2]": "manual-cultura-fmarini",
    "JSABBAG": "manual-cultura-jsabbag",
    "Gabriela Ribeiro Fisio": "gabriela-ribeiro-fisio",
}

# termos que devem aparecer primeiro no carrossel
PRIORIDADE = ("capa", "save-the-date", "id-cod3", "codebeer-logos", "contracapa")


def slugify(texto: str) -> str:
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    texto = re.sub(r"[^a-zA-Z0-9]+", "-", texto).strip("-").lower()
    return re.sub(r"-{2,}", "-", texto) or "img"


def chave_natural(p: Path):
    nome = slugify(p.stem)
    prio = next((i for i, t in enumerate(PRIORIDADE) if nome.startswith(t)), len(PRIORIDADE))
    partes = [int(t) if t.isdigit() else t for t in re.split(r"(\d+)", nome)]
    return (prio, partes)


def main():
    if DESTINO.exists():
        shutil.rmtree(DESTINO)
    DESTINO.mkdir(parents=True)

    grupos: dict[str, list[Path]] = {}
    for pasta, slug in MAPA.items():
        p = ORIGEM / pasta
        if not p.is_dir():
            print(f"[aviso] pasta não encontrada: {pasta}")
            continue
        arquivos = [f for f in p.iterdir() if f.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}]
        grupos.setdefault(slug, []).extend(sorted(arquivos, key=chave_natural))

    manifest, antes, depois = {}, 0, 0
    for slug, arquivos in grupos.items():
        (DESTINO / slug).mkdir()
        manifest[slug] = []
        usados = set()
        for i, src in enumerate(arquivos, 1):
            base = slugify(src.stem)
            nome = f"{i:02d}-{base}.webp"
            while nome in usados:
                nome = nome.replace(".webp", "-b.webp")
            usados.add(nome)
            out = DESTINO / slug / nome

            with Image.open(src) as im:
                im = im.convert("RGBA") if im.mode in ("P", "LA", "RGBA") else im.convert("RGB")
                if im.width > LARGURA_MAX:
                    h = round(im.height * LARGURA_MAX / im.width)
                    im = im.resize((LARGURA_MAX, h), Image.LANCZOS)
                im.save(out, "WEBP", quality=QUALIDADE, method=6)
                w, h = im.size

            antes += src.stat().st_size
            depois += out.stat().st_size
            manifest[slug].append({
                "src": f"assets/img/projetos/{slug}/{nome}",
                "w": w, "h": h, "original": f"{src.parent.name}/{src.name}",
            })
            print(f"  {slug}/{nome}")

    (DESTINO / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nTotal: {sum(len(v) for v in manifest.values())} imagens | "
          f"{antes/1e6:.1f} MB -> {depois/1e6:.1f} MB ({100 - depois/antes*100:.0f}% menor)")


if __name__ == "__main__":
    main()
