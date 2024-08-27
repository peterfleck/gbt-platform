import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./app/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
		config.externals.push("@node-rs/argon2", "@node-rs/bcrypt");
		return config;
	},
    async redirects() {
        return [
            {
                source: '/:locale(\\w{2})',
                destination: '/:locale/interlinear',
                permanent: false
            },
            {
                source: '/:locale(\\w{2})/admin',
                destination: '/:locale/admin/languages',
                permanent: false
            },
            {
                source: '/:locale(\\w{2})/admin/languages/:code((?!new))',
                destination: '/:locale/admin/languages/:code/settings',
                permanent: false
            },
            {
                source: '/:locale(\\w{2})/interlinear',
                destination: '/:locale/interlinear/verses/01001001',
                permanent: false
            },
            {
                source: '/:locale(\\w{2})/interlinear/verses',
                destination: '/:locale/interlinear/verses/01001001',
                permanent: false
            },
        ]
    }
};

export default withNextIntl(nextConfig);
