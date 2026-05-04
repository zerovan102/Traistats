-- Hapus tabel jika sudah ada (opsional untuk reset)
DROP TABLE IF EXISTS habit_logs;
DROP TABLE IF EXISTS habits;

-- Buat tabel Habits
CREATE TABLE habits (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    icon TEXT DEFAULT 'Workout',
    subtitle TEXT DEFAULT '',
    frequency TEXT DEFAULT 'Daily',
    timeOfDay TEXT DEFAULT 'Morning',
    colorTheme TEXT DEFAULT '#0A84FF',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buat tabel HabitLogs (untuk melacak habit yang selesai)
CREATE TABLE habit_logs (
    id SERIAL PRIMARY KEY,
    habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(habit_id, date)
);
