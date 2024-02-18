import { Middleware } from '@curveball/kernel';
import { State } from './state.js';
import { stateToHal } from './hal.js';
import { NotAcceptable } from '@curveball/http-errors';
import { stateToSiren } from './siren.js';

const formats = [
  'application/hal+json',
  'application/vnd.siren+json',
] as const;

const formatNames: Record<typeof formats[number], string> = {
  'application/hal+json': 'HAL',
  'application/vnd.siren+json': 'Siren',
};

export function hateoasMw(): Middleware {

  return async(ctx, next) => {

    await next();
    if (!(ctx.response.body instanceof State)) {
      return;
    }

    const uri = ctx.response.body.uri ?? ctx.request.requestTarget;
    const desiredFormat = ctx.accepts(...formats);

    switch(desiredFormat) {
      case 'application/hal+json' :
        ctx.response.type = desiredFormat;
        ctx.response.body = stateToHal(
          ctx.response.body,
          {
            defaultUri: uri,
          }
        );
        break;
      case 'application/vnd.siren+json' :
        ctx.response.type = desiredFormat;
        ctx.response.body = stateToSiren(
          ctx.response.body,
          {
            defaultUri: uri,
          }
        );
        break;
      default:
        throw new NotAcceptable('You must pass a valid Accept header for this endpoint. This endpoint supports the following: ' + formats.join(','));
    }

    for(const format of formats.filter(format => format !== desiredFormat)) {
      ctx.response.links.add({
        href: uri,
        rel: 'alternate',
        type: format,
        title: formatNames[format],
      });
    }

  };

}
