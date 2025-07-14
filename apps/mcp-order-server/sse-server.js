import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';

import { server } from './server-logic.js';

const app = express();

let transport;
app.get('/sse', async (req, res) => {
	console.log('/sse GET: client connecting');
	transport = new SSEServerTransport('/messages', res);
	await server.connect(transport);
	console.log('/sse GET: server.connect complete, SSE ready');
});

app.post('/messages', async (req, res) => {
	if (!transport) {
		res
			.status(503)
			.json({ error: 'SSE transport not initialized. Connect to /sse first.' });
		console.warn(
			'POST /messages received before SSE transport was initialized.'
		);
		return;
	}
	await transport.handlePostMessage(req, res);
});

const port = process.env.PORT || 8081;
app.listen(port, () => {
	console.log(`MCP SSE Server is running on http://localhost:${port}/sse`);
});
