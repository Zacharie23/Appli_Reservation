function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}


describe('escapeHtml()', () => {

    test('✅ retourne une chaîne vide si null', () => {
        expect(escapeHtml(null)).toBe('');
    });

    test('✅ retourne une chaîne vide si undefined', () => {
        expect(escapeHtml(undefined)).toBe('');
    });

    test('✅ ne modifie pas une chaîne sans caractères spéciaux', () => {
        expect(escapeHtml('Corrida de Dax')).toBe('Corrida de Dax');
    });

    test('✅ échappe les chevrons <>', () => {
        expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    });

    test('✅ échappe les guillemets "', () => {
        expect(escapeHtml('"test"')).toBe('&quot;test&quot;');
    });

    test('✅ échappe les esperluettes &', () => {
        expect(escapeHtml('rock & roll')).toBe('rock &amp; roll');
    });

    test('✅ protège contre une injection XSS basique', () => {
        const input  = '<img src=x onerror="alert(1)">';
        const output = escapeHtml(input);
        expect(output).not.toContain('<');
        expect(output).not.toContain('>');
        expect(output).not.toContain('"');
    });

});