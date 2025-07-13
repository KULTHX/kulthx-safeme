import { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers
    ]
});

// Configuration
const CONFIG = {
    TOKEN: process.env.DISCORD_TOKEN,
    PREFIX: process.env.BOT_PREFIX || '!',
    MAX_SCRIPT_LENGTH: parseInt(process.env.MAX_SCRIPT_LENGTH) || 50000,
    MAX_SCRIPTS_PER_USER: parseInt(process.env.MAX_SCRIPTS_PER_USER) || 50,
    SCRIPTS_FILE: './scripts.json'
};

// Database functions
async function readScripts() {
    try {
        const data = await fs.readFile(CONFIG.SCRIPTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(CONFIG.SCRIPTS_FILE, '[]');
            return [];
        }
        console.error('Error reading scripts file:', error);
        return [];
    }
}

async function writeScripts(scripts) {
    try {
        await fs.writeFile(CONFIG.SCRIPTS_FILE, JSON.stringify(scripts, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing scripts file:', error);
        return false;
    }
}

async function saveScript(scriptData) {
    const scripts = await readScripts();
    scripts.push(scriptData);
    return writeScripts(scripts) ? scriptData : null;
}

async function getScript(id) {
    const scripts = await readScripts();
    return scripts.find(script => script.id === id);
}

async function getUserScripts(userId) {
    const scripts = await readScripts();
    return scripts.filter(script => script.userId === userId);
}

async function deleteScript(id) {
    let scripts = await readScripts();
    const initialLength = scripts.length;
    scripts = scripts.filter(script => script.id !== id);
    return scripts.length < initialLength ? writeScripts(scripts) : false;
}

async function updateScript(id, updates) {
    let scripts = await readScripts();
    const index = scripts.findIndex(script => script.id === id);
    if (index === -1) return false;

    scripts[index] = { ...scripts[index], ...updates };
    return writeScripts(scripts);
}

// Utility functions
function validateScript(script) {
    if (!script || typeof script !== 'string') {
        return 'النص يجب أن يكون نص غير فارغ';
    }
    if (script.trim().length === 0) {
        return 'النص لا يمكن أن يكون فارغاً';
    }
    if (script.length > CONFIG.MAX_SCRIPT_LENGTH) {
        return `النص طويل جداً. الحد الأقصى ${CONFIG.MAX_SCRIPT_LENGTH} حرف`;
    }
    return null;
}

function createSuccessEmbed(title, description, fields = []) {
    const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp()
        .setFooter({ text: 'KULTHX SAFEME Bot' });
    
    if (fields.length > 0) {
        embed.addFields(fields);
    }
    
    return embed;
}

function createErrorEmbed(title, description) {
    return new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp()
        .setFooter({ text: 'KULTHX SAFEME Bot' });
}

function createInfoEmbed(title, description, fields = []) {
    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp()
        .setFooter({ text: 'KULTHX SAFEME Bot' });
    
    if (fields.length > 0) {
        embed.addFields(fields);
    }
    
    return embed;
}

// Bot events
client.once('ready', () => {
    console.log(`🚀 ${client.user.tag} جاهز للعمل!`);
    console.log(`📊 متصل بـ ${client.guilds.cache.size} سيرفر`);
    
    // Set bot status
    client.user.setActivity('حماية نصوص Roblox', { type: 'WATCHING' });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    let content = message.content;
    let isDirectMessage = message.channel.type === 1; // DM channel type

    if (!isDirectMessage && !content.startsWith(CONFIG.PREFIX)) return;

    if (!isDirectMessage) {
        content = content.slice(CONFIG.PREFIX.length).trim();
    } else {
        content = content.trim();
    }

    const args = content.split(/ +/);
    const command = args.shift().toLowerCase();

    try {
        switch (command) {
            case 'help':
            case 'مساعدة':
                await handleHelpCommand(message);
                break;
            case 'protect':
            case 'حماية':
                await handleProtectCommand(message);
                break;
            case 'myscripts':
            case 'نصوصي':
                await handleMyScriptsCommand(message);
                break;
            case 'stats':
            case 'إحصائيات':
                await handleStatsCommand(message);
                break;
            default:
                await message.reply({
                    embeds: [createErrorEmbed('❌ أمر غير معروف', `استخدم \`${CONFIG.PREFIX}help\` لعرض الأوامر المتاحة`)]
                });
        }
    } catch (error) {
        console.error('Error handling command:', error);
        await message.reply({
            embeds: [createErrorEmbed('❌ خطأ', 'حدث خطأ أثناء تنفيذ الأمر')]
        });
    }
});

// Command handlers
async function handleHelpCommand(message) {
    const embed = createInfoEmbed(
        '📋 أوامر البوت',
        'قائمة بجميع الأوامر المتاحة:',
        [
            {
                name: `${CONFIG.PREFIX}protect أو ${CONFIG.PREFIX}حماية`,
                value: 'حماية نص Roblox جديد',
                inline: false
            },
            {
                name: `${CONFIG.PREFIX}myscripts أو ${CONFIG.PREFIX}نصوصي`,
                value: 'عرض جميع النصوص المحمية الخاصة بك',
                inline: false
            },
            {
                name: `${CONFIG.PREFIX}stats أو ${CONFIG.PREFIX}إحصائيات`,
                value: 'عرض إحصائيات البوت',
                inline: false
            },
            {
                name: `${CONFIG.PREFIX}help أو ${CONFIG.PREFIX}مساعدة`,
                value: 'عرض هذه القائمة',
                inline: false
            }
        ]
    );

    await message.reply({ embeds: [embed] });
}

async function handleProtectCommand(message) {
    const modal = new ModalBuilder()
        .setCustomId('protect_script_modal')
        .setTitle('حماية نص Roblox');

    const scriptInput = new TextInputBuilder()
        .setCustomId('script_input')
        .setLabel('النص المراد حمايته')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('الصق نص Roblox هنا...')
        .setRequired(true)
        .setMaxLength(CONFIG.MAX_SCRIPT_LENGTH);

    const firstActionRow = new ActionRowBuilder().addComponents(scriptInput);
    modal.addComponents(firstActionRow);

    await message.reply({
        embeds: [createInfoEmbed('🔒 حماية النص', 'اضغط على الزر أدناه لفتح نافذة إدخال النص')],
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('open_protect_modal')
                    .setLabel('🔒 حماية نص')
                    .setStyle(ButtonStyle.Primary)
            )
        ]
    });
}

async function handleMyScriptsCommand(message) {
    const userScripts = await getUserScripts(message.author.id);
    
    if (userScripts.length === 0) {
        await message.reply({
            embeds: [createInfoEmbed('📝 نصوصي', 'لا توجد نصوص محمية بعد')]
        });
        return;
    }

    const embed = createInfoEmbed(
        '📝 نصوصي',
        `لديك ${userScripts.length} نص محمي:`,
        userScripts.slice(0, 10).map((script, index) => ({
            name: `${index + 1}. النص ${script.id.substring(0, 8)}...`,
            value: `📅 تاريخ الإنشاء: ${new Date(script.createdAt).toLocaleDateString('ar-SA')}\n🔗 الرابط: \`loadstring(game:HttpGet("https://3000-i178vlk1kcjesbklnip0p-34d9b61c.manusvm.computer/script.lua?id=${script.id}"))()\``,
            inline: false
        }))
    );

    if (userScripts.length > 10) {
        embed.setFooter({ text: `عرض 10 من أصل ${userScripts.length} نص` });
    }

    await message.reply({ embeds: [embed] });
}

async function handleStatsCommand(message) {
    const allScripts = await readScripts();
    const userScripts = await getUserScripts(message.author.id);
    
    const embed = createInfoEmbed(
        '📊 إحصائيات البوت',
        'إحصائيات عامة للبوت:',
        [
            {
                name: '📝 إجمالي النصوص المحمية',
                value: allScripts.length.toString(),
                inline: true
            },
            {
                name: '👤 نصوصك المحمية',
                value: userScripts.length.toString(),
                inline: true
            },
            {
                name: '🏆 السيرفرات',
                value: client.guilds.cache.size.toString(),
                inline: true
            }
        ]
    );

    await message.reply({ embeds: [embed] });
}

// Interaction handlers
client.on('interactionCreate', async (interaction) => {
    try {
        if (interaction.isButton()) {
            if (interaction.customId === 'open_protect_modal') {
                const modal = new ModalBuilder()
                    .setCustomId('protect_script_modal')
                    .setTitle('حماية نص Roblox');

                const scriptInput = new TextInputBuilder()
                    .setCustomId('script_input')
                    .setLabel('النص المراد حمايته')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('الصق نص Roblox هنا...')
                    .setRequired(true)
                    .setMaxLength(CONFIG.MAX_SCRIPT_LENGTH);

                const firstActionRow = new ActionRowBuilder().addComponents(scriptInput);
                modal.addComponents(firstActionRow);

                await interaction.showModal(modal);
            }
        }

        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'protect_script_modal') {
                await handleProtectModalSubmit(interaction);
            }
        }
    } catch (error) {
        console.error('Error handling interaction:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                embeds: [createErrorEmbed('❌ خطأ', 'حدث خطأ أثناء معالجة طلبك')],
                ephemeral: true
            });
        }
    }
});

async function handleProtectModalSubmit(interaction) {
    const script = interaction.fields.getTextInputValue('script_input');
    const userId = interaction.user.id;

    // Validate script
    const scriptError = validateScript(script);
    if (scriptError) {
        await interaction.reply({
            embeds: [createErrorEmbed('❌ خطأ في النص', scriptError)],
            ephemeral: true
        });
        return;
    }

    // Check user script limit
    const userScripts = await getUserScripts(userId);
    if (userScripts.length >= CONFIG.MAX_SCRIPTS_PER_USER) {
        await interaction.reply({
            embeds: [createErrorEmbed('❌ تم الوصول للحد الأقصى', `الحد الأقصى ${CONFIG.MAX_SCRIPTS_PER_USER} نص لكل مستخدم`)],
            ephemeral: true
        });
        return;
    }

    // Check for duplicate script
    const normalizedScript = script.trim().replace(/\s+/g, ' ');
    const existingScript = userScripts.find(
        (data) => data.script.trim().replace(/\s+/g, ' ') === normalizedScript
    );

    if (existingScript) {
        await interaction.reply({
            embeds: [createErrorEmbed('❌ نص مكرر', 'هذا النص محمي مسبقاً!')],
            ephemeral: true
        });
        return;
    }

    // Generate unique ID and save script
    const id = crypto.randomBytes(16).toString('hex');
    const scriptData = {
        id,
        script,
        userId,
        createdAt: new Date().toISOString(),
        accessCount: 0,
        lastAccessed: null
    };

    const saved = await saveScript(scriptData);
    if (!saved) {
        await interaction.reply({
            embeds: [createErrorEmbed('❌ خطأ في الحفظ', 'فشل في حفظ النص')],
            ephemeral: true
        });
        return;
    }

    // Create success response
    const loadstring = `loadstring(game:HttpGet("https://3000-i178vlk1kcjesbklnip0p-34d9b61c.manusvm.computer/script.lua?id=${id}"))()`;
    
    const embed = createSuccessEmbed(
        '✅ تم حماية النص بنجاح!',
        'تم إنشاء رابط آمن للنص',
        [
            {
                name: '🆔 معرف النص',
                value: id,
                inline: false
            },
            {
                name: '🔗 كود التنفيذ',
                value: `\`\`\`lua\n${loadstring}\n\`\`\``,
                inline: false
            }
        ]
    );

    await interaction.reply({ embeds: [embed], ephemeral: true });
}

// Error handling
client.on('error', (error) => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    process.exit(1);
});

// Start the bot
client.login(CONFIG.TOKEN).catch((error) => {
    console.error('Failed to login:', error);
    process.exit(1);
});



