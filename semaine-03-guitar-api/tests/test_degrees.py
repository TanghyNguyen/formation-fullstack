from degrees import chord_degree, DEGREE_STYLES


def test_root_is_tonique():
    assert chord_degree(0, 0) == "1"
    assert chord_degree(7, 7) == "1"


def test_major_third():
    assert chord_degree(4, 0) == "3"


def test_styles_cover_all_degrees():
    assert len(DEGREE_STYLES) == 12
