import { Search } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder = 'Tìm kiếm...', disabled = false }) {
    return (
        <div style={{ position: 'relative' }}>
            <Search
                size={16}
                style={{
                    position: 'absolute',
                    left: '0.9rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9fb2c9',
                }}
            />
            <input
                aria-label="Tìm kiếm"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                style={{ paddingLeft: '2.5rem' }}
            />
        </div>
    );
}
