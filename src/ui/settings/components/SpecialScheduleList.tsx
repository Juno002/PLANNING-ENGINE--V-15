import { useAppStore } from '@/store/useAppStore'
import { ShiftAssignment, SpecialSchedule } from '@/domain/types'
import { Trash2, Calendar, Clock, StickyNote, Edit } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useEditMode } from '@/hooks/useEditMode'

export function SpecialScheduleList({ repId, onEdit }: { repId: string, onEdit: (schedule: SpecialSchedule) => void }) {
    const { specialSchedules, removeSpecialSchedule } = useAppStore(s => ({
        specialSchedules: s.specialSchedules.filter(ss => ss.representativeId === repId),
        removeSpecialSchedule: s.removeSpecialSchedule,
    }));
    const { mode } = useEditMode()

    if (specialSchedules.length === 0) return null;

    const formatDays = (days: number[]) => {
        const dayMap = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
        return days.map(d => dayMap[d]).join(', ');
    }

    const formatAssignment = (a: ShiftAssignment) => {
        if (a.type === 'NONE') return 'Libre';
        if (a.type === 'BOTH') return 'Mixto';
        return a.shift === 'DAY' ? 'Día' : 'Noche';
    }

    return (
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {specialSchedules.map(ss => (
                <div key={ss.id} style={{ fontSize: '12px', color: '#4b5563', background: '#f9fafb', padding: '10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Calendar size={14} />
                            <span>{format(parseISO(ss.startDate), 'dd/MM/yy')} - {format(parseISO(ss.endDate), 'dd/MM/yy')}</span>
                            {ss.note && (
                                <div title={ss.note} style={{ cursor: 'help', color: '#f59e0b' }}>
                                    <StickyNote size={14} />
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                            <Clock size={14} />
                            <span>{formatDays(ss.daysOfWeek)} &rarr; <strong>{formatAssignment(ss.assignment)}</strong></span>
                        </div>
                    </div>
                    {mode === 'ADMIN_OVERRIDE' && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                                onClick={() => onEdit(ss)}
                                style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                title="Editar Horario"
                            >
                                <Edit size={14} />
                            </button>
                            <button
                                onClick={() => removeSpecialSchedule(ss.id)}
                                style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                title="Eliminar Horario"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
