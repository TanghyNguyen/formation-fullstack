from caged import compute_frets, get_shape, list_chord_types


def test_c_major_e_shape():
    shape = get_shape("M", "E")
    assert shape is not None
    assert compute_frets(0, shape) == [8, 10, 10, 9, 8, 8]


def test_open_e_major_e_shape():
    shape = get_shape("M", "E")
    assert shape is not None
    assert compute_frets(4, shape) == [0, 2, 2, 1, 0, 0]


def test_dim_has_fewer_positions_than_major():
    major = next(t for t in list_chord_types() if t["key"] == "M")
    dim = next(t for t in list_chord_types() if t["key"] == "dim")
    assert len(dim["positions"]) < len(major["positions"])
