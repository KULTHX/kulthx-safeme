-- KULTHX SAFEME Test Script
print("🔒 KULTHX SAFEME - Script Protection Test")
print("✅ This script is protected and working correctly!")
print("🚀 Script executed successfully from Discord Bot")

-- Test basic Roblox functionality
if game then
    print("🎮 Running in Roblox environment")
    print("👤 Player: " .. tostring(game.Players.LocalPlayer))
else
    print("⚠️ Not running in Roblox environment")
end

-- Test script protection
print("🛡️ Script ID: TEST_SCRIPT")
print("📅 Protected on: " .. os.date("%Y-%m-%d %H:%M:%S"))
print("🔗 Loaded via KULTHX SAFEME Discord Bot")

return "KULTHX_SAFEME_TEST_SUCCESS"

