'use strict';
const resumePdf = (() => {
  let libraryPromise;
  function loadLibrary() {
    if (window.PDFLib) return Promise.resolve(window.PDFLib);
    if (!libraryPromise) {
      libraryPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const timeout = setTimeout(fail, 20000);
        function fail() {
          clearTimeout(timeout);
          script.remove();
          libraryPromise = undefined;
          reject(new Error('PDF library could not be loaded'));
        }
        script.src = 'assets/pdf-lib-1.17.1.min.js';
        script.onload = () => {
          clearTimeout(timeout);
          if (window.PDFLib) resolve(window.PDFLib);
          else fail();
        };
        script.onerror = fail;
        document.head.append(script);
      });
    }
    return libraryPromise;
  }

  async function create(bytes, date) {
    if (!Number.isFinite(date.getTime())) throw new Error('Invalid download date');
    const {PDFDocument} = await loadLibrary();
    const pdf = await PDFDocument.load(bytes);
    const stamp = [date.getDate(), date.getMonth() + 1, date.getFullYear()]
      .map((part, index) => String(part).padStart(index === 2 ? 4 : 2, '0')).join('.');
    const form = pdf.getForm();
    form.getTextField('downloadDate').setText(stamp);
    form.flatten();
    pdf.setCreationDate(date);
    pdf.setModificationDate(date);
    return pdf.save();
  }
  return {create};
})();
