import React from 'react';

const DraftDocument = ({ draft }) => {
  return (
    <div>
      <h2>Borrador del Documento</h2>
      <pre>{draft}</pre>
    </div>
  );
};

export default DraftDocument;