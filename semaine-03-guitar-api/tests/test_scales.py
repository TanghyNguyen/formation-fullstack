from scales import pitch_classes_from_root, scale_degrees_from_root, SCALES


def test_major_scale_from_c():
    assert pitch_classes_from_root(0, SCALES["major"]) == [0, 2, 4, 5, 7, 9, 11]


def test_major_scale_from_g():
    assert pitch_classes_from_root(7, SCALES["major"]) == [0, 2, 4, 6, 7, 9, 11]


def test_scale_degrees_from_a_major():
    assert scale_degrees_from_root(9, SCALES["major"]) == [9, 11, 1, 2, 4, 6, 8]


def test_blues_has_six_notes():
    assert len(pitch_classes_from_root(0, SCALES["blues"])) == 6
