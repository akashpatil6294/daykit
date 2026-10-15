"""One isolated conversion; the parent controls lifetime and deletes the job folder."""
import json
import sys
from pathlib import Path
from .engines import ConversionError, make_engine


def main():
    job = Path(sys.argv[1])
    try:
        output, media, ocr = make_engine().convert(
            (job / 'request.bin').read_bytes(), sys.argv[2], sys.argv[3], job
        )
        (job / 'output.bin').write_bytes(output)
        result = {'media': media, 'ocr': ocr}
    except ConversionError as exc:
        result = {'error': exc.code}
    (job / 'result.json').write_text(json.dumps(result))


if __name__ == '__main__':
    main()
