export const alertService = {
    getAlerts: async () => {
        const res = await fetch("/api/alerts");
        return res.json();
    }
}