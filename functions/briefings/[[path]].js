/* Os arquivos de briefing (destinatário, referência de senha, perguntas
   de briefings protegidos) nunca são servidos diretamente. A função de
   /b/[slug] lê cada arquivo pelo binding interno env.ASSETS.          */
import { notFoundPage } from '../_lib/pages.js';
import { html } from '../_lib/server.js';

export const onRequest = () => html(notFoundPage(), 404);
