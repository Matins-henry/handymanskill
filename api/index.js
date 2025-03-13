import { createRequestHandler } from '../server/src/handler';

export default async function handler(request, response) {
  const requestHandler = await createRequestHandler();
  return requestHandler(request, response);
}
