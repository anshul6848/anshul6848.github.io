function shareTool(customUrl) {
    const url = customUrl || window.__shareUrlOverride || window.location.href;
    const shareData = {
        title: document.title,
        text: window.__shareTextOverride || document.querySelector('meta[name="description"]')?.content || 'Check out this amazing spiritual tool!',
        url
    };

    if (navigator.share) {
        navigator.share(shareData)
            .then(() => console.log('Shared successfully'))
            .catch((err) => console.log('Error sharing:', err));
    } else {
        // Fallback for desktop/unsupported browsers
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Link copied to clipboard!');
        }).catch(() => {
            prompt('Copy this link to share:', window.location.href);
        });
    }
}
