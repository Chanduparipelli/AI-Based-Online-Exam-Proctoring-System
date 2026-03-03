# backend/ai/generator.py

def generate_questions_from_text(text):
    # Dummy AI logic - replace with ML later
    lines = text.split(".")
    questions = []

    for idx, line in enumerate(lines[:5]):
        if len(line.strip()) < 10:
            continue

        questions.append({
            "question": f"What is meant by: {line[:40]}?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": "Option A"
        })

    return questions
