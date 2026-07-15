def test_recommend_major_returns_chords():
    from recommend import recommend_chords

    recs = recommend_chords("major", 0)
    assert len(recs) > 0
    assert all("root_pc" in r and "chord_type" in r for r in recs)
