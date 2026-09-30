import re
with open('src/store/useStore.ts', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace("'https://contained-produced-rules-perspective.trycloudflare.com", "getApiUrl(get().appStoreType) + '")
c = c.replace("`https://contained-produced-rules-perspective.trycloudflare.com", "`${getApiUrl(get().appStoreType)}")
# Also fix the one where it was passed to fetch without quotes? No, the ones above handle it.

with open('src/store/useStore.ts', 'w', encoding='utf-8') as f:
    f.write(c)
