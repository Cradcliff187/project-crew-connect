
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				montserrat: ['Montserrat', 'sans-serif'],
				opensans: ['Open Sans', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					muted: 'hsl(var(--sidebar-muted))',
					'muted-foreground': 'hsl(var(--sidebar-muted-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				construction: {
					DEFAULT: '#0485ea',
					50: '#f0f7fe',
					100: '#dcedfd',
					200: '#bfdefc',
					300: '#93c7fa',
					400: '#60a9f6',
					500: '#3a8cf1',
					600: '#0485ea',
					700: '#0569bc',
					800: '#0a5799',
					900: '#0c487d',
				},
				earth: {
					DEFAULT: '#d2691e', // Terracotta
					50: '#fdf6f0',
					100: '#f8e8dc',
					200: '#f2d1b3',
					300: '#eab282',
					400: '#e28a4f',
					500: '#d2691e',
					600: '#b85117',
					700: '#973d15',
					800: '#7a3116',
					900: '#652a16',
				},
				sage: {
					DEFAULT: '#87a878',
					50: '#f3f7f1',
					100: '#e4ede0',
					200: '#cddcc6',
					300: '#b0c7a6',
					400: '#87a878',
					500: '#699054',
					600: '#537343',
					700: '#415b36',
					800: '#35482e',
					900: '#2d3d28',
				},
				warmgray: {
					DEFAULT: '#f5f3f2',
					50: '#f5f3f2',
					100: '#e5e1de',
					200: '#ccc5bf',
					300: '#b2a79f',
					400: '#968a7f',
					500: '#837567',
					600: '#6f6258',
					700: '#5a5046',
					800: '#4a423a',
					900: '#3d3630',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				fadeIn: {
					from: { opacity: '0' },
					to: { opacity: '1' },
				},
				slideIn: {
					from: { transform: 'translateY(10px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' },
				},
				pulse: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' },
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' },
				},
				'shimmer': {
					'0%': { backgroundPosition: '-1000px 0' },
					'100%': { backgroundPosition: '1000px 0' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fadeIn 0.5s ease-out forwards',
				'slide-in': 'slideIn 0.3s ease-out forwards',
				'pulse-slow': 'pulse 3s infinite',
				'float': 'float 5s ease-in-out infinite',
				'shimmer': 'shimmer 2s infinite linear',
			},
			boxShadow: {
				'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
				'card': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
				'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
				'construction': '0 4px 12px -2px rgba(4, 133, 234, 0.15)',
				'earth': '0 4px 12px -2px rgba(210, 105, 30, 0.15)',
			},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: '65ch',
						color: 'var(--tw-prose-body)',
						lineHeight: '1.75',
					},
				},
			},
			backgroundImage: {
				'gradient-card': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
