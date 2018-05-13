import asyncPlugin from 'preact-cli-plugin-fast-async';

export default (config, env, helpers) => {
	asyncPlugin(config);

	helpers.getPluginsByName(
		config,
		'DefinePlugin'
	)[0].plugin.definitions.PRERENDER = String(env.ssr === true);
};
