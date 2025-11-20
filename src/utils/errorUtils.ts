export function extractErrorMessage(error: unknown): string {
    try {
        const anyErr = error as any;
        if (anyErr?.response) {
            const data = anyErr.response.data;
            if (typeof data === 'string') return data;
            if (typeof data?.message === 'string' && data.message) return data.message;
            if (typeof data?.error === 'string' && data.error) return data.error;
            if (Array.isArray(data?.errors) && data.errors.length) {
                const first = data.errors[0];
                if (typeof first === 'string') return first;
                if (typeof (first as any)?.message === 'string') return (first as any).message;
            }
            if (Array.isArray(data?.details) && data.details.length) {
                const first = data.details[0];
                if (typeof first === 'string') return first;
                if (typeof (first as any)?.message === 'string') return (first as any).message;
            }
        }
        if ((anyErr as any)?.message) return (anyErr as any).message as string;
    } catch {
        // ignore
    }
    return 'Something went wrong. Please try again.';
}
