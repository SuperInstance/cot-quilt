"""Pins for docs/JEV-DOCTRINE.md — cot-quilt's WIRE oracle under jev-quilt R6 doctrine.

FAIL-first law: these pins must be RED on pristine master (doc absent) and
GREEN only on the branch that carries the doctrine document. Zero deps (stdlib).
Run from the repo root:  python3 -m unittest discover -s tests -v
"""

import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parent.parent
DOC = ROOT / "docs" / "JEV-DOCTRINE.md"
SRC = (ROOT / "cot_decompose.py").read_text(encoding="utf-8")


class JevDoctrinePins(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not DOC.exists():
            raise AssertionError("doctrine doc absent — pins RED by definition on master")
        cls.doc = DOC.read_text(encoding="utf-8")

    def test_cites_jev_quilt_by_name(self):
        self.assertIn("SuperInstance/jev-quilt", self.doc)

    def test_r6_classes_all_present_with_verdicts(self):
        for cls, verdict in [("hash-drift", "REJECT"), ("port-lies", "REJECT"),
                             ("rephrased-true", "ACCEPT"), ("one-lie-among-five", "DISCUSS")]:
            self.assertIn(cls, self.doc)
            self.assertRegex(self.doc, re.compile(re.escape(cls) + r".{0,80}" + verdict))

    def test_no_fake_code_dependency_claim(self):
        # anti-laundering: the doc must explicitly disclaim a code import
        self.assertIn("does not import", self.doc)
        self.assertIn("jev-quilt code", self.doc)

    def test_doc_describes_real_wire_code(self):
        # the citation must attach to live code, not vapor
        self.assertIn("def typesafe(", SRC)
        self.assertIn("TS_URL", SRC)
        self.assertIn("jev-latest", SRC)
        self.assertIn("typesafe()", self.doc)

    def test_jev_unavailable_degradation_pinned(self):
        # absence-propagates doctrine named in doc + true in code (None-by-.get, not a literal)
        self.assertIn("answers: None", self.doc)
        self.assertIn("'load_score': sc.get('score')", SRC)
        self.assertIn("max_load", SRC)


if __name__ == "__main__":
    unittest.main()
