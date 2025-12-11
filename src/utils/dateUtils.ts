/**
 * Helpers para manipulação de datas no timezone de Brasília (GMT-3)
 */

/**
 * Retorna a data atual no formato YYYY-MM-DD no timezone de Brasília
 */
export const getTodayBrasilia = (): string => {
    const now = new Date();
    // Ajusta para o timezone de Brasília (UTC-3)
    const brasiliaOffset = -3 * 60; // em minutos
    const utcOffset = now.getTimezoneOffset(); // em minutos
    const diff = brasiliaOffset - utcOffset;
    const brasiliaTime = new Date(now.getTime() + diff * 60 * 1000);
    return brasiliaTime.toISOString().split('T')[0];
};

/**
 * Retorna a data de ontem no formato YYYY-MM-DD no timezone de Brasília
 */
export const getYesterdayBrasilia = (): string => {
    const now = new Date();
    const brasiliaOffset = -3 * 60;
    const utcOffset = now.getTimezoneOffset();
    const diff = brasiliaOffset - utcOffset;
    const brasiliaTime = new Date(now.getTime() + diff * 60 * 1000);
    brasiliaTime.setDate(brasiliaTime.getDate() - 1);
    return brasiliaTime.toISOString().split('T')[0];
};

/**
 * Converte uma string de data YYYY-MM-DD para Date no início do dia em Brasília
 */
export const parseDateBrasilia = (dateStr: string): Date => {
    // Cria a data às 12:00 para evitar problemas de fuso horário
    return new Date(dateStr + 'T12:00:00-03:00');
};

/**
 * Formata uma data para exibição no formato brasileiro (DD/MM/YYYY)
 */
export const formatDateBrasilia = (dateStr: string): string => {
    const date = parseDateBrasilia(dateStr);
    return date.toLocaleDateString('pt-BR');
};

/**
 * Formata uma data para exibição longa no formato brasileiro
 */
export const formatDateLongBrasilia = (dateStr: string): string => {
    const date = parseDateBrasilia(dateStr);
    return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
};
