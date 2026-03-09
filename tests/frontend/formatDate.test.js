// tests/frontend/formatDate.test.js

function formatDate(dateStr) {
    if (!dateStr) return '';
    let date;
    if (dateStr.includes('/')) {
        const [d, m, y] = dateStr.split('/');
        date = new Date(`${y}-${m}-${d}`);
    } else {
        date = new Date(dateStr);
    }
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
}

function formatDay(dateStr) {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit' });
}

function formatMonth(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase();
}

function formatYear(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).getFullYear();
}


describe('formatDate()', () => {

    test('✅ retourne chaîne vide si null', () => {
        expect(formatDate(null)).toBe('');
        expect(formatDate('')).toBe('');
    });

    test('✅ formate une date ISO (YYYY-MM-DD)', () => {
        const result = formatDate('2026-08-15');
        expect(result).toContain('2026');
        expect(result).toMatch(/août|august/i);
    });

    test('✅ formate une date DD/MM/YYYY', () => {
        const result = formatDate('15/08/2026');
        expect(result).toContain('2026');
    });

});


describe('formatDay / formatMonth / formatYear', () => {

    test('✅ formatDay retourne -- si null', () => {
        expect(formatDay(null)).toBe('--');
    });

    test('✅ formatDay retourne le jour sur 2 chiffres', () => {
        expect(formatDay('2026-08-05')).toBe('05');
    });

    test('✅ formatMonth retourne chaîne vide si null', () => {
        expect(formatMonth(null)).toBe('');
    });

    test('✅ formatMonth retourne le mois en majuscules', () => {
        const result = formatMonth('2026-08-15');
        expect(result).toBe(result.toUpperCase());
    });

    test('✅ formatYear retourne l\'année correcte', () => {
        expect(formatYear('2026-08-15')).toBe(2026);
    });

    test('✅ formatYear retourne chaîne vide si null', () => {
        expect(formatYear(null)).toBe('');
    });

});
