'use client';
import { useState, useEffect, useCallback } from 'react';

// Ikhtisar Komponen Baru untuk Layout Obsdslp
export default function ObsdslpApp() {
  const [habits, setHabits] = useState<any[]>([]);
  const [activeTimerHabit, setActiveTimerHabit] = useState<any>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const clockInterval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const fetchHabits = useCallback(async () => {    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/habits?date=${todayStr}&t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setHabits(data || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleAddHabit = async (title: string) => {
    if (!title) return;
    try {
      await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, frequency: 'Daily', timeOfDay: 'Anytime' })
      });
      fetchHabits();
    } catch (e) {
      console.error('Add failed', e);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (isRecording && activeTimerHabit) {
      interval = setInterval(() => setTimerSeconds(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, activeTimerHabit]);

  const toggleHabit = async (id: number, forceDone?: boolean) => {
    try {
      const habit = habits.find(h => h.id === id);
      if (!habit) return;
      const isCurrentlyDone = habit.logs && habit.logs.length > 0;
      const nextDoneState = forceDone !== undefined ? forceDone : !isCurrentlyDone;

      const todayStr = new Date().toISOString().split('T')[0];
      await fetch(`/api/habits/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: todayStr, done: nextDoneState })
      });
      fetchHabits();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStopRecording = () => {
    if (timerSeconds >= 10 && activeTimerHabit) {
      toggleHabit(activeTimerHabit.id, true);
    }
    setIsRecording(false);
    setActiveTimerHabit(null);
    setTimerSeconds(0);
  };

  const deleteHabit = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kegiatan ini secara permanen?')) return;
    try {
      const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        alert('Gagal menghapus: ' + (errorData.details || errorData.error || 'Terjadi kesalahan tidak dikenal'));
        return;
      }
      fetchHabits();
    } catch (e: any) {
      alert('Koneksi Error: ' + e.message);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="obs-container">
      <style dangerouslySetInnerHTML={{__html: `
        body {
          margin: 0; padding: 0;
          background-color: #0A0510;
          background-image: linear-gradient(rgba(10, 5, 16, 0.8), rgba(10, 5, 16, 0.85)), url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=2000');
          background-size: cover;
          background-attachment: fixed;
          background-position: center;
          color: #FFFFFF;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
        }
        .obs-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          grid-template-areas: 
            "header clock"
            "quests clock"
            "tracker points"
            "habits stats"
            "market stats";
        }
        .area-header { grid-area: header; }
        .area-clock { grid-area: clock; }
        .area-quests { grid-area: quests; }
        .area-tracker { grid-area: tracker; }
        .area-points { grid-area: points; }
        .area-habits { grid-area: habits; }
        .area-market { grid-area: market; }
        .area-stats { grid-area: stats; }

        @media (max-width: 1024px) {
          .obs-container { gap: 20px; padding: 20px 15px; }
        }
        @media (max-width: 900px) {
          .obs-container { 
            grid-template-columns: 1fr; 
            grid-template-areas: 
              "header"
              "clock"
              "quests"
              "tracker"
              "points"
              "habits"
              "market"
              "stats";
          }
          .obs-maintitle { font-size: clamp(20px, 8vw, 32px); }
          .obs-desc { max-width: 100%; font-size: 13px; line-height: 1.4; }
          .obs-title-section { margin-bottom: 12px; }
          .radar-image-container { transform: scale(0.8); margin: -40px 0; }
        }
        @media (max-width: 480px) {
          /* FORCING 2-COLUMN LAYOUT ON MOBILE */
          .obs-container { 
            padding: 10px 6px; 
            gap: 8px; 
            grid-template-columns: 1fr 1.1fr; 
            grid-template-areas: 
              "header clock"
              "quests clock"
              "tracker points"
              "habits stats"
              "market stats";
          }
          .obs-maintitle { font-size: 14px; margin-bottom: 2px; }
          .obs-maintitle span { display: block; font-size: 10px; margin-left: 0; }
          .obs-desc { display: none; }
          .obs-title-section { margin-bottom: 4px; }
          
          .obs-card { padding: 8px; border-radius: 8px; }
          .obs-card h3 { font-size: 11px !important; }
          
          .quest-item { padding: 4px 6px; border-radius: 6px; gap: 6px; margin-bottom: 6px; }
          .quest-icon { width: 18px; height: 18px; font-size: 10px; }
          .quest-item div div:first-child { font-size: 9px !important; }
          .quest-item div div:last-child { font-size: 7px !important; }
          
          .chart-container { height: 60px; gap: 3px; }
          .chart-bar-wrap { min-width: 15px; }
          .chart-bar-wrap div { font-size: 7px !important; margin-bottom: 2px !important; margin-top: 2px !important; }
          
          .habit-row { gap: 6px; margin-bottom: 8px; }
          .habit-row-icon { width: 24px; height: 24px; border-radius: 6px; font-size: 10px; }
          .habit-title { font-size: 10px !important; margin-bottom: 0px !important; }
          .habit-row div:nth-child(2) div:last-child { font-size: 8px !important; }
          .habit-row div:nth-child(3) { font-size: 8px !important; padding: 3px 6px !important; }
          
          .prog-item { margin-bottom: 8px; }
          .prog-header { font-size: 8px !important; margin-bottom: 3px !important; }
          .prog-track { height: 3px; }
          
          .radar-image-container { transform: scale(0.35); margin: -130px -40px; width: auto; }
          .obs-circle-ui { transform: scale(0.45); margin: -70px auto; }
          
          /* Marketplace adjustments */
          .area-market svg text { font-size: 8px !important; }
          .area-market div:last-child { font-size: 7px !important; padding-top: 5px !important; }
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 10px rgba(183, 82, 255, 0.2); }
          50% { box-shadow: 0 0 25px rgba(183, 82, 255, 0.5); }
          100% { box-shadow: 0 0 10px rgba(183, 82, 255, 0.2); }
        }
        @keyframes rotateRadar {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .obs-card {
          background: #130D1E;
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 4px 20px rgba(183, 82, 255, 0.05);
          border: 1px solid rgba(183, 82, 255, 0.1);
          animation: fadeSlideUp 0.6s ease-out forwards;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .obs-card:hover {
          transform: translateY(-5px);
          border-color: rgba(183, 82, 255, 0.4);
          box-shadow: 0 10px 30px rgba(183, 82, 255, 0.15);
        }

        .area-header { animation-delay: 0.1s; }
        .area-clock { animation-delay: 0.2s; }
        .area-quests { animation-delay: 0.3s; }
        .area-tracker { animation-delay: 0.4s; }
        .area-points { animation-delay: 0.5s; }
        .area-habits { animation-delay: 0.6s; }

        .obs-title-section {
          margin-bottom: 40px;
        }
        .obs-maintitle {
          font-size: 44px;
          font-weight: 800;
          color: #FFF;
          text-transform: uppercase;
          line-height: 1;
          text-shadow: 0 0 20px rgba(183, 82, 255, 0.6), 0 0 40px rgba(183, 82, 255, 0.3);
          margin-bottom: 8px;
          letter-spacing: 2px;
          animation: fadeSlideUp 0.8s ease-out;
        }
        .obs-maintitle span {
          display: block;
          font-weight: 300;
        }
        .obs-desc {
          color: #8C7AAB;
          font-size: 14px;
          line-height: 1.6;
          max-width: 80%;
        }

        .quest-item {
          display: flex;
          align-items: center;
          background: rgba(183, 82, 255, 0.05);
          border: 1px solid rgba(183, 82, 255, 0.15);
          border-radius: 40px;
          padding: 12px 20px;
          margin-bottom: 12px;
          gap: 15px;
        }
        .quest-icon {
          width: 32px; height: 32px;
          background: rgba(183, 82, 255, 0.2);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 10px rgba(183, 82, 255, 0.4);
        }
        .chart-container {
          display: flex;
          align-items: flex-end;
          gap: 20px;
          height: 150px;
          margin-top: 20px;
          overflow-x: auto;
          scrollbar-width: none; /* Firefox */
        }
        .chart-container::-webkit-scrollbar { display: none; } /* Chrome/Safari */
        
        .chart-bar-wrap {
          flex: 1;
          min-width: 40px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          height: 100%;
        }
        .chart-bar {
          width: 100%;
          background: #B752FF;
          border-radius: 6px 6px 0 0;
          box-shadow: 0 0 15px rgba(183, 82, 255, 0.3);
        }
        .prog-item {
          margin-bottom: 20px;
        }
        .prog-header {
          display: flex; justify-content: space-between;
          font-size: 13px; font-weight: 600; margin-bottom: 8px;
        }
        .prog-track {
          height: 4px; background: rgba(255,255,255,0.1);
          border-radius: 4px; overflow: hidden;
        }
        .prog-fill {
          height: 100%; background: #B752FF;
          box-shadow: 0 0 10px #B752FF;
        }
        .habit-row {
          display: flex; align-items: center; gap: 16px;
          margin-bottom: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .habit-row:hover {
          transform: translateX(5px);
        }
        .habit-row-icon {
          width: 48px; height: 48px;
          background: rgba(183, 82, 255, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(183, 82, 255, 0.3);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .habit-row.done .habit-row-icon {
          background: rgba(48, 209, 88, 0.2);
          border-color: #30D158;
          box-shadow: 0 0 15px rgba(48, 209, 88, 0.4);
        }
        .habit-row.done .habit-title {
          text-decoration: line-through;
          color: #8C7AAB;
        }
        .radar-image-container {
          width: 100%;
          height: 400px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 30px;
        }
        @media (max-width: 480px) {
          .radar-image-container { height: 300px; }
          .radar-bg:nth-child(2) { width: 300px !important; height: 300px !important; }
          .radar-bg:first-child { width: 220px !important; height: 220px !important; }
          .anime-img-placeholder { width: 150px !important; height: 200px !important; }
        }
        .radar-bg {
          width: 300px; height: 300px;
          border-radius: 50%;
          border: 1px solid rgba(183, 82, 255, 0.3);
          position: absolute;
        }
        .radar-cross {
          position: absolute;
          width: 100%; height: 100%;
          background: linear-gradient(to right, transparent 49.5%, rgba(183,82,255,0.2) 49.5%, rgba(183,82,255,0.2) 50.5%, transparent 50.5%),
                      linear-gradient(to bottom, transparent 49.5%, rgba(183,82,255,0.2) 49.5%, rgba(183,82,255,0.2) 50.5%, transparent 50.5%);
        }
        .anime-img-placeholder {
          width: 200px; height: 260px;
          background: url('https://images.unsplash.com/photo-1542360663-8f4023eb8aec?auto=format&fit=crop&q=80&w=400') center/cover;
          border-radius: 20px;
          z-index: 10;
          box-shadow: 0 0 30px rgba(183, 82, 255, 0.4);
          border: 2px solid rgba(183, 82, 255, 0.2);
        }
        .timer-modal {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(10, 5, 16, 0.9);
          backdrop-filter: blur(10px);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .timer-circle {
          width: 200px; height: 200px;
          border-radius: 50%;
          border: 4px solid #B752FF;
          display: flex; align-items: center; justify-content: center;
          font-size: 48px; font-weight: 700; font-family: monospace;
          box-shadow: 0 0 40px rgba(183, 82, 255, 0.4);
          margin-bottom: 30px;
        }
        @media (max-width: 480px) {
          .timer-circle { width: 160px; height: 160px; font-size: 36px; }
        }
        .btn-neon {
          padding: 15px 40px; border-radius: 30px; font-size: 18px; font-weight: 600;
          border: none; cursor: pointer; transition: all 0.2s;
          width: 100%; max-width: 250px;
        }
        .btn-neon-start { background: #B752FF; color: white; box-shadow: 0 0 20px rgba(183, 82, 255, 0.5); }
        .btn-neon-stop { background: #FF453A; color: white; box-shadow: 0 0 20px rgba(255, 69, 58, 0.5); }

        .obs-stat-split {
          display: flex;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 35px;
        }
        .obs-stat-side {
          flex: 1;
        }
        .obs-stat-side-left {
          padding-right: 25px;
          border-right: 1px solid rgba(255,255,255,0.1);
        }
        .obs-stat-side-right {
          padding-left: 25px;
          display: flex;
          flex-direction: column;
        }
        
        .obs-circle-ui {
          position: relative;
          width: 220px;
          height: 220px;
          margin: 0 auto;
          border: 1px solid rgba(183, 82, 255, 0.2);
          borderRadius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 600px) {
          .obs-stat-split { flex-direction: column; gap: 30px; }
          .obs-stat-side-left { padding-right: 0; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 30px; }
          .obs-stat-side-right { padding-left: 0; }
          .obs-circle-ui { transform: scale(0.85); margin: -20px auto; }
        }

      `}} />

      {/* Timer Modal */}
      {activeTimerHabit && (
        <div className="timer-modal">
          <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>{activeTimerHabit.title}</h2>
          <p style={{ color: '#8C7AAB', marginBottom: '30px' }}>Recording Activity...</p>
          <div className="timer-circle">
            {formatTime(timerSeconds)}
          </div>
          {!isRecording ? (
            <button className="btn-neon btn-neon-start" onClick={() => setIsRecording(true)}>START</button>
          ) : (
            <button className="btn-neon btn-neon-stop" onClick={handleStopRecording}>STOP & SAVE</button>
          )}
          <button style={{ marginTop: '20px', background: 'transparent', color: '#8C7AAB', border: 'none', cursor: 'pointer' }} onClick={() => setActiveTimerHabit(null)}>Cancel</button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="area-header">
        <div className="obs-title-section">
          <h1 className="obs-maintitle">Obsdslp <span>SYSTEM</span></h1>
          <p className="obs-desc">Player Stats initialized. Tracking daily routines and increasing your parameters through continuous leveling.</p>
        </div>
      </div>

      <div className="area-quests">
        <div className="quest-item">
          <div className="quest-icon">⚡</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>Daily Login Complete</div>
            <div style={{ fontSize: '11px', color: '#8C7AAB' }}>Rewards collected</div>
          </div>
        </div>
        <div className="quest-item">
          <div className="quest-icon">🎯</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>Refilming Cosmic Skill</div>
            <div style={{ fontSize: '11px', color: '#8C7AAB' }}>Quest generated automatically</div>
          </div>
        </div>
      </div>

      <div className="area-tracker">
        <div className="obs-card mt-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Skill Tracker</h3>
            <span style={{ fontSize: '12px', background: 'rgba(183, 82, 255, 0.2)', padding: '4px 10px', borderRadius: '12px' }}>Monthly →</span>
          </div>
          <div className="chart-container">
            {habits.slice(0, 5).map((h, i) => {
              const isDoneToday = h.logs && h.logs.length > 0;
              // Reset histori poin menjadi 0 untuk memulai bulan baru
              const historicalPoints = 0; 
              // Tambah 1 poin jika dikerjakan hari ini
              const totalPoints = historicalPoints + (isDoneToday ? 1 : 0);
              
              // Kalkulasi tinggi batang: 1 poin = 1 hari dari target 30 hari dalam sebulan
              // Tinggi minimal 5% agar batangnya tetap terlihat sedikit walau 0 poin
              const heightPct = Math.min(100, Math.max(5, (totalPoints / 30) * 100));

              return (
                <div key={i} className="chart-bar-wrap" title={h.title}>
                  <div style={{ fontSize: '11px', color: '#FFF', marginBottom: '4px', whiteSpace: 'normal', overflow: 'hidden', width: '100%', textAlign: 'center', fontWeight: 'bold', lineHeight: '1', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{h.title}</div>
                  <div className="chart-bar" style={{ height: `${heightPct}%`, opacity: 1 - i * 0.15 }}></div>
                  <div style={{ fontSize: '11px', color: '#8C7AAB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center', marginTop: '8px' }}>{totalPoints} pts</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="area-habits">
        <div className="obs-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Keseharian</h3>
            <span style={{ fontSize: '12px', color: '#8C7AAB' }}>Click to Start</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              id="new-habit-input"
              type="text"
              placeholder="Add new skill..."
              style={{ flex: 1, background: 'rgba(183, 82, 255, 0.05)', border: '1px solid rgba(183, 82, 255, 0.2)', padding: '10px 15px', borderRadius: '12px', color: '#FFF', outline: 'none' }}
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
                  const title = e.currentTarget.value.trim();
                  e.currentTarget.value = '';
                  await handleAddHabit(title);
                }
              }}
            />
            <button 
              onClick={() => {
                const input = document.getElementById('new-habit-input') as HTMLInputElement;
                if (input && input.value.trim() !== '') {
                  handleAddHabit(input.value.trim());
                  input.value = '';
                }
              }}
              style={{ background: '#B752FF', border: 'none', borderRadius: '12px', padding: '0 20px', color: '#FFF', fontWeight: 'bold', cursor: 'pointer' }}>+</button>
          </div>

          {habits.map((h, i) => {
            const isDone = h.logs && h.logs.length > 0;
            return (
              <div className={`habit-row ${isDone ? 'done' : ''}`} key={i}>
                <div
                  className="habit-row-icon"
                  onClick={(e) => { e.stopPropagation(); toggleHabit(h.id); }}
                  title="Klik untuk ceklis manual"
                >
                  <span style={{ color: isDone ? '#30D158' : '#B752FF' }}>{isDone ? '✓' : '✨'}</span>
                </div>
                <div style={{ flex: 1 }} onClick={() => !isDone && setActiveTimerHabit(h)}>
                  <div className="habit-title" style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{h.title}</div>
                  <div style={{ fontSize: '12px', color: '#8C7AAB' }}>{h.subtitle}</div>
                </div>
                <div
                  style={{ fontSize: '12px', background: isDone ? 'transparent' : 'rgba(183, 82, 255, 0.1)', color: isDone ? '#8C7AAB' : '#B752FF', padding: '6px 12px', borderRadius: '16px', cursor: isDone ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                  onClick={() => !isDone && setActiveTimerHabit(h)}
                  title="Buka Timer"
                >
                  {!isDone && <span>⏱️</span>}
                  {isDone ? h.frequency : 'Timer'}
                </div>
                <div
                  style={{ fontSize: '14px', background: 'rgba(255, 69, 58, 0.1)', color: '#FF453A', padding: '6px 10px', borderRadius: '16px', cursor: 'pointer', marginLeft: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={(e) => { e.stopPropagation(); deleteHabit(h.id); }}
                  title="Hapus Kegiatan"
                >
                  🗑️
                </div>
              </div>
            );
          })}
          {habits.length === 0 && <p style={{ color: '#8C7AAB', fontSize: '13px' }}>No skills recorded yet.</p>}
        </div>
      </div>

      <div className="area-market">
        <div className="obs-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Marketplace (Monthly Line)</h3>
            <span style={{ fontSize: '12px', background: 'rgba(183, 82, 255, 0.2)', padding: '4px 10px', borderRadius: '12px' }}>30 Days</span>
          </div>
          <div style={{ height: '140px', position: 'relative', width: '100%' }}>
            {(() => {
              const days = 30;
              const totalH = habits.length;
              const completedT = habits.filter(h => h.logs && h.logs.length > 0).length;
              const todayPct = totalH > 0 ? (completedT / totalH) * 100 : 0;
              
              // Membuat data tiruan untuk hari 1 sampai 29
              const points = Array.from({length: days}).map((_, i) => {
                if (i === days - 1) return todayPct; // Hari ini (sesuai data asli)
                // Pola naik turun buatan (mock) untuk 29 hari sebelumnya
                const mockVal = 20 + Math.sin(i * 0.8) * 15 + (i * 1.5); 
                return Math.min(100, Math.max(0, mockVal));
              });

              // Konfigurasi SVG
              const width = 100;
              const height = 100;
              const stepX = width / (days - 1);
              
              const pathData = points.map((val, i) => {
                const x = i * stepX;
                const y = height - (val / 100 * height);
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ');

              const fillPath = `${pathData} L ${width} ${height} L 0 ${height} Z`;

              return (
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(183, 82, 255, 0.4)" />
                      <stop offset="100%" stopColor="rgba(183, 82, 255, 0.0)" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  <path d={fillPath} fill="url(#lineGlow)" />
                  <path d={pathData} fill="none" stroke="#B752FF" strokeWidth="2" vectorEffect="non-scaling-stroke" filter="url(#glow)" />
                  
                  {points.map((val, i) => {
                    if (i % 7 === 0 || i === days - 1) {
                      const x = i * stepX;
                      const y = height - (val / 100 * height);
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r="2" fill="#FFF" stroke="#B752FF" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                          <text x={x} y={y - 5} fontSize="4" fill="#8C7AAB" textAnchor="middle">{Math.round(val)}%</text>
                        </g>
                      );
                    }
                    return null;
                  })}
                </svg>
              );
            })()}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', fontSize: '11px', color: '#8C7AAB', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
            <span>Day 1</span>
            <span>Day 15</span>
            <span>Day 30 (Today)</span>
          </div>
      </div>
    </div>

      {/* CLOCK SECTION */}
      <div className="area-clock">
        <div className="radar-image-container">
          <div className="radar-bg"></div>
          <div className="radar-bg" style={{ width: 'min(400px, 90vw)', height: 'min(400px, 90vw)', borderStyle: 'dashed', opacity: 0.5 }}></div>
          <div className="radar-cross"></div>
          {/* Placeholder for the Anime Girl Avatar with Analog Clock overlay */}
          <div className="anime-img-placeholder" style={{ position: 'relative', overflow: 'hidden' }}>
             <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10,5,16,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 'min(160px, 40vw)', height: 'min(160px, 40vw)', borderRadius: '50%', border: '2px solid rgba(183,82,255,0.4)', position: 'relative', boxShadow: 'inset 0 0 20px rgba(183,82,255,0.2), 0 0 20px rgba(183,82,255,0.2)', background: 'rgba(10,5,16,0.3)', backdropFilter: 'blur(2px)' }}>
                   {/* Clock Markings */}
                   {[...Array(12)].map((_, i) => (
                      <div key={i} style={{ position: 'absolute', top: 0, left: '50%', width: '2px', height: '100%', transform: `translateX(-50%) rotate(${i * 30}deg)` }}>
                        <div style={{ width: '100%', height: i % 3 === 0 ? '8px' : '4px', background: i % 3 === 0 ? '#B752FF' : 'rgba(255,255,255,0.3)', borderRadius: '2px' }}></div>
                      </div>
                   ))}
                   {/* Center Dot */}
                   <div style={{ position: 'absolute', top: '50%', left: '50%', width: '10px', height: '10px', background: '#FFF', borderRadius: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, boxShadow: '0 0 10px #FFF' }}></div>
                   
                   {/* Hands */}
                   {(() => {
                     if (!time) return null;
                     const seconds = time.getSeconds();
                     const minutes = time.getMinutes();
                     const hours = time.getHours();
                     const secAngle = seconds * 6;
                     const minAngle = minutes * 6 + seconds * 0.1;
                     const hourAngle = (hours % 12) * 30 + minutes * 0.5;
                     
                     return (
                       <>
                         <div style={{ position: 'absolute', bottom: '50%', left: 'calc(50% - 2.5px)', width: '5px', height: '25%', background: '#FFF', transformOrigin: 'bottom center', transform: `rotate(${hourAngle}deg)`, borderRadius: '3px', zIndex: 3, boxShadow: '0 0 5px rgba(0,0,0,0.5)' }}></div>
                         <div style={{ position: 'absolute', bottom: '50%', left: 'calc(50% - 1.5px)', width: '3px', height: '35%', background: '#E2D5F8', transformOrigin: 'bottom center', transform: `rotate(${minAngle}deg)`, borderRadius: '2px', zIndex: 4, boxShadow: '0 0 5px rgba(0,0,0,0.5)' }}></div>
                         <div style={{ position: 'absolute', bottom: '50%', left: 'calc(50% - 1px)', width: '2px', height: '45%', background: '#B752FF', transformOrigin: 'bottom center', transform: `rotate(${secAngle}deg)`, borderRadius: '1px', zIndex: 5, boxShadow: '0 0 8px #B752FF' }}></div>
                         <div style={{ position: 'absolute', bottom: '45%', left: 'calc(50% - 1px)', width: '2px', height: '10%', background: '#B752FF', transformOrigin: 'bottom center', transform: `rotate(${secAngle + 180}deg)`, borderRadius: '1px', zIndex: 5 }}></div>
                       </>
                     );
                   })()}
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* POINTS SECTION */}
      <div className="area-points">

        <div className="obs-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Skill Points</h3>
          </div>

          <div className="prog-item">
            <div className="prog-header"><span>Charisma</span><span>230%</span></div>
            <div className="prog-track"><div className="prog-fill" style={{ width: '80%' }}></div></div>
          </div>
          <div className="prog-item">
            <div className="prog-header"><span>Game Skills</span><span>350%</span></div>
            <div className="prog-track"><div className="prog-fill" style={{ width: '60%' }}></div></div>
          </div>
          <div className="prog-item">
            <div className="prog-header"><span>Value Points</span><span>1200%</span></div>
            <div className="prog-track"><div className="prog-fill" style={{ width: '90%' }}></div></div>
          </div>
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="area-stats">

        <div className="obs-card" style={{ padding: '30px' }}>
          {(() => {
            const totalHabits = habits.length;
            const completedToday = habits.filter(h => h.logs && h.logs.length > 0).length;
            
            // Mock formulas to give life to the stats
            const vultureStat = totalHabits * 15 + completedToday * 5;
            const votinerStat = totalHabits === 0 ? "0.00" : ((completedToday / totalHabits) * 10).toFixed(2);
            const goalDays = completedToday > 0 ? 7 : 6;
            
            const bar1Height = totalHabits === 0 ? 10 : Math.max(15, (completedToday / totalHabits) * 100);
            const bar2Height = Math.min(95, 40 + (completedToday * 10));
            const bar3Height = Math.min(85, totalHabits * 10);
            const manataTotal = 1300 + vultureStat;
            const completionRatio = totalHabits === 0 ? 0 : completedToday / totalHabits;
            const radarRotation = completionRatio * 180;
            const orbSize = 45 + (completionRatio * 20); // 45px to 65px
            const eyeSize = 55 + (completionRatio * 20); // 55px to 75px
            const innerScale = 1 + (completionRatio * 0.3); // Scale up to 1.3
            const dashRotation = completionRatio * -90; // Reverse rotation

            return (
              <>
                {/* TOP CIRCLE UI */}
                <div className="obs-circle-ui">
                  <div style={{ position: 'absolute', width: '140px', height: '140px', border: '1px dashed rgba(183, 82, 255, 0.4)', borderRadius: '50%', transform: `scale(${innerScale}) rotate(${dashRotation}deg)`, transition: 'all 1s ease' }}></div>
                  <div style={{ position: 'absolute', width: '70px', height: '70px', borderBottom: '2px solid #B752FF', borderRadius: '50%', transform: `rotate(${radarRotation}deg)`, transition: 'transform 1s ease' }}></div>
                  <div style={{ position: 'absolute', top: '-10px', left: '30px', width: `${orbSize}px`, height: `${orbSize}px`, background: 'rgba(183, 82, 255, 0.2)', border: '2px solid #B752FF', borderRadius: '50%', boxShadow: `0 0 ${15 + completionRatio*20}px #B752FF`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: `${20 + completionRatio*5}px`, transition: 'all 1s ease' }}>🔮</div>
                  <div style={{ position: 'absolute', top: '-5px', right: '15px', width: `${eyeSize}px`, height: `${eyeSize}px`, background: 'rgba(183, 82, 255, 0.1)', border: '2px solid #B752FF', borderRadius: '50%', boxShadow: `0 0 ${20 + completionRatio*30}px #B752FF`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: `${24 + completionRatio*8}px`, transition: 'all 1s ease' }}>👁️</div>
                  
                  <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '11px', letterSpacing: '2px', zIndex: 2 }}>
                    <div style={{ marginBottom: '25px', opacity: 0.5 + (completionRatio*0.5), transition: 'opacity 1s ease' }}>Tigreusion</div>
                    <div style={{ opacity: 0.8 + (completionRatio*0.2), transition: 'opacity 1s ease' }}>Aultin-con</div>
                  </div>
                </div>

                {/* CENTER GLOW BUTTON */}
                <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '50px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '20%', right: '20%', height: '1px', background: 'rgba(183, 82, 255, 0.2)', zIndex: 0 }}></div>
                  <div style={{ width: '50px', height: '50px', background: '#B752FF', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px #B752FF', color: 'white', fontWeight: 'bold', fontSize: '20px', position: 'relative', zIndex: 1 }}>
                    ✧
                  </div>
                  <div style={{ fontSize: '15px', marginTop: '15px', color: '#E2D5F8', letterSpacing: '2px', fontWeight: '600' }}>Skill</div>
                </div>

                {/* BOTTOM SPLIT SECTION */}
                <div className="obs-stat-split">
                  {/* LEFT SIDE */}
                  <div className="obs-stat-side obs-stat-side-left">
                    {/* Vulture row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFF' }}>Total EXP</div>
                        <div style={{ fontSize: '11px', color: '#8C7AAB', marginTop: '2px' }}>Accumulated</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFF' }}>{vultureStat}</div>
                        <div style={{ fontSize: '11px', color: '#B752FF', marginTop: '2px' }}>Multi</div>
                      </div>
                    </div>
                    
                    {/* Votiner row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFF' }}>Pace</div>
                        <div style={{ fontSize: '11px', color: '#8C7AAB', marginTop: '2px' }}>Daily Rate</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '28px', height: '28px', background: '#B752FF', borderRadius: '50%', boxShadow: '0 0 20px #B752FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '12px', fontWeight: 'bold' }}>Q</div>
                        <div style={{ width: '6px', height: '6px', background: '#B752FF', borderRadius: '50%' }}></div>
                        <div style={{ width: '4px', height: '4px', background: 'rgba(183, 82, 255, 0.5)', borderRadius: '50%' }}></div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFF' }}>{votinerStat}</div>
                      </div>
                    </div>
                    
                    {/* Goal row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#8C7AAB' }}>Streak</div>
                        <div style={{ fontSize: '11px', color: '#8C7AAB', marginTop: '2px' }}>Active Limit</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFF' }}>-</div>
                        <div style={{ fontSize: '11px', color: '#8C7AAB', marginTop: '2px' }}>Days {goalDays}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* RIGHT SIDE */}
                  <div className="obs-stat-side obs-stat-side-right">
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFF' }}>Manata 2024</div>
                      <div style={{ fontSize: '11px', color: '#8C7AAB', marginTop: '2px' }}>{manataTotal}</div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '20px', flex: 1, paddingBottom: '20px' }}>
                      <div style={{ width: '35px', height: `${bar1Height}%`, background: '#B752FF', borderRadius: '6px', boxShadow: '0 0 20px rgba(183,82,255,0.4)', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'height 1s ease' }}>
                        <span style={{ fontSize: '10px', color: '#FFF' }}>@</span>
                        <div style={{ position: 'absolute', bottom: '-25px', width: '100%', textAlign: 'center', fontSize: '11px', color: '#8C7AAB' }}>Anis</div>
                      </div>
                      <div style={{ width: '35px', height: `${bar2Height}%`, background: '#8C7AAB', borderRadius: '6px', position: 'relative', backgroundImage: 'radial-gradient(circle, #130D1E 1.5px, transparent 1.5px)', backgroundSize: '6px 6px', transition: 'height 1s ease' }}>
                        <div style={{ position: 'absolute', bottom: '-25px', width: '100%', textAlign: 'center', fontSize: '11px', color: '#8C7AAB' }}>Goe</div>
                      </div>
                      <div style={{ width: '35px', height: `${bar3Height}%`, background: '#8C7AAB', borderRadius: '6px', position: 'relative', backgroundImage: 'radial-gradient(circle, #130D1E 1.5px, transparent 1.5px)', backgroundSize: '6px 6px', transition: 'height 1s ease' }}>
                        <div style={{ position: 'absolute', bottom: '-25px', width: '100%', textAlign: 'center', fontSize: '11px', color: '#8C7AAB' }}>400</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
