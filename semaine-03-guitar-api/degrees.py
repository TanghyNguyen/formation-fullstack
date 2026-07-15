DEGREE_BY_INTERVAL = [
    "1",
    "b2",
    "2",
    "b3",
    "3",
    "4",
    "b5",
    "5",
    "b6",
    "6",
    "b7",
    "7",
]

DEGREE_STYLES = {
    "1": {"color": "#ff6b4a", "label": "Tonique"},
    "b2": {"color": "#9a948a", "label": "Seconde mineure"},
    "2": {"color": "#9a948a", "label": "Seconde majeure"},
    "b3": {"color": "#6bcb77", "label": "Tierce mineure"},
    "3": {"color": "#6bcb77", "label": "Tierce majeure"},
    "4": {"color": "#4d96ff", "label": "Quarte juste"},
    "b5": {"color": "#9a948a", "label": "Triton"},
    "5": {"color": "#e8c84b", "label": "Quinte juste"},
    "b6": {"color": "#9a948a", "label": "Sixte mineure"},
    "6": {"color": "#9a948a", "label": "Sixte majeure"},
    "b7": {"color": "#b57bff", "label": "Septième mineure"},
    "7": {"color": "#b57bff", "label": "Septième majeure"},
}


def chord_degree(pc: int, root_pc: int) -> str:
    interval = (pc - root_pc + 12) % 12
    return DEGREE_BY_INTERVAL[interval]
