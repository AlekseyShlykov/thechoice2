import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { toPng } from 'html-to-image';
import './ShareResultButton.css';

const CAPTURE_ID = 'result-graph-capture';

type Props = {
  resultTitle: string;
};

export default function ShareResultButton({ resultTitle }: Props) {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pngBlob, setPngBlob] = useState<Blob | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const gameUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : '';

  const buildShareText = useCallback(() => {
    return t('results.shareBody', { title: resultTitle, url: gameUrl });
  }, [t, resultTitle, gameUrl]);

  const capturePng = useCallback(async (): Promise<Blob | null> => {
    const el = document.getElementById(CAPTURE_ID);
    if (!el) return null;
    await document.fonts.ready;
    const dataUrl = await toPng(el, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: '#111111',
    });
    const res = await fetch(dataUrl);
    return res.blob();
  }, []);

  const openModal = async () => {
    setBusy(true);
    setPngBlob(null);
    try {
      const blob = await capturePng();
      setPngBlob(blob);
      setModalOpen(true);
    } catch (e) {
      console.error(e);
      setToast(t('results.shareCaptureFailed'));
      setTimeout(() => setToast(null), 3000);
    } finally {
      setBusy(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const downloadImage = () => {
    if (!pngBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(pngBlob);
    a.download = 'the-choice-result.png';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const shareNative = async () => {
    if (!pngBlob) return;
    const text = buildShareText();
    const title = t('results.shareResult');
    const file = new File([pngBlob], 'the-choice-result.png', { type: 'image/png' });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text, title });
        closeModal();
        return;
      }
      if (navigator.share) {
        await navigator.share({ text, title });
        closeModal();
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') console.error(err);
    }
  };

  const openX = () => {
    downloadImage();
    const text = buildShareText();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setToast(t('results.shareImageSaved'));
    setTimeout(() => setToast(null), 4000);
  };

  const copyAndOpen = async (openUrl: string) => {
    downloadImage();
    const text = buildShareText();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard may be unavailable
    }
    setToast(t('results.shareImageSaved'));
    setTimeout(() => setToast(null), 4000);
    window.open(openUrl, '_blank', 'noopener,noreferrer');
  };

  const openLinkedIn = () => {
    const u = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(gameUrl)}`;
    void copyAndOpen(u);
  };

  const openFacebook = () => {
    const u = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(gameUrl)}`;
    void copyAndOpen(u);
  };

  const shareFile =
    pngBlob &&
    new File([pngBlob], 'the-choice-result.png', { type: 'image/png' });

  const canShareFiles =
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    shareFile &&
    navigator.canShare({ files: [shareFile] });

  const canShareTextOnly =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    !canShareFiles;

  const modal =
    modalOpen &&
    createPortal(
      <div
        className="share-result-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-result-title"
        onClick={(e) => e.target === e.currentTarget && closeModal()}
        onKeyDown={(e) => e.key === 'Escape' && closeModal()}
      >
        <div className="share-result-modal">
          <h2 id="share-result-title" className="share-result-modal-title">
            {t('results.shareModalTitle')}
          </h2>
          <p className="share-result-preview-label">{buildShareText()}</p>
          <div className="share-result-actions">
            {canShareFiles && (
              <button type="button" className="share-result-action primary" onClick={() => void shareNative()}>
                {t('results.shareNative')}
              </button>
            )}
            {canShareTextOnly && (
              <button
                type="button"
                className="share-result-action primary"
                onClick={() => void shareNative()}
              >
                {t('results.shareNativeTextOnly')}
              </button>
            )}
            <button type="button" className="share-result-action" onClick={downloadImage}>
              {t('results.shareDownloadImage')}
            </button>
            <button type="button" className="share-result-action" onClick={openX}>
              {t('results.shareOnX')}
            </button>
            <button type="button" className="share-result-action" onClick={openLinkedIn}>
              {t('results.shareOnLinkedIn')}
            </button>
            <button type="button" className="share-result-action" onClick={openFacebook}>
              {t('results.shareOnFacebook')}
            </button>
          </div>
          <p className="share-result-hint">{t('results.shareHint')}</p>
          <button type="button" className="share-result-close" onClick={closeModal}>
            {t('results.shareClose')}
          </button>
        </div>
      </div>,
      document.body,
    );

  return (
    <>
      <button
        type="button"
        className="choice-button share-result-trigger"
        disabled={busy}
        onClick={(e) => {
          e.stopPropagation();
          void openModal();
        }}
      >
        {busy ? t('results.sharePreparing') : t('results.shareResult')}
      </button>
      {modal}
      {toast &&
        createPortal(
          <div className="share-result-toast" role="status">
            {toast}
          </div>,
          document.body,
        )}
    </>
  );
}
