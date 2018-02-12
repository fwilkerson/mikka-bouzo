export default (config, env, helpers) => {
	helpers.getPluginsByName(
		config,
		'DefinePlugin'
	)[0].plugin.definitions.PRERENDER = String(env.ssr === true);
};
