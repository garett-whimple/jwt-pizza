import {expect, test} from "playwright-test-coverage";

const storeArray = [{
    id: 1,
    name: "SLC",
    totalRevenue: 0.0659
}]

test('franchise dashboard page', async ({ page }) => {

    // FRANCHISE LOGIN
    await page.route('*/**/api/auth', async (route) => {
        if (route.request().method() === 'PUT') {
            const loginReq = { email: 'f@jwt.com', password: 'franchisee' };
            const loginRes = { user: { id: 3, name: 'pizza franchisee', email: 'f@jwt.com', roles: [{ role: 'franchisee' }] }, token: 'bcdefg' };
            expect(route.request().method()).toBe('PUT');
            expect(route.request().postDataJSON()).toMatchObject(loginReq);
            await route.fulfill({ json: loginRes });
        } else if (route.request().method() === 'DELETE') {
            expect(route.request().headers()['authorization']).toBe('Bearer bcdefg')
            const logoutRes = { message: "logout successful" }
            expect(route.request().method()).toBe('DELETE');
            await route.fulfill({ json: logoutRes });
        }
    });

    // GET FRANCHISE INFO
    await page.route('*/**/api/franchise/3', async (route) => {
        expect(route.request().method()).toBe('GET');
        expect(route.request().headers()['authorization']).toBe('Bearer bcdefg')
        const franchiseRes = [
            {
                id: 1,
                name: "pizzaPocket",
                admins: [
                    {
                        id: 3,
                        name: "pizza franchisee",
                        email: "f@jwt.com"
                    }
                ],
                stores: storeArray
            }
        ]
        await route.fulfill({ json: franchiseRes });
    });

    // CREATE STORE
    await page.route('*/**/api/franchise/1/store', async (route) => {
        expect(route.request().headers()['authorization']).toBe('Bearer bcdefg')
        expect(route.request().method()).toBe('POST');
        const storeReq = {
            "id": "",
            "name": "NEW_TEST_STORE"
        }
        const franchiseRes = {
            id: 42,
            franchiseId: 1,
            name: "NEW_TEST_STORE"
        }
        storeArray.push({name: franchiseRes.name, id: franchiseRes.id, totalRevenue: 0})
        expect(route.request().postDataJSON()).toMatchObject(storeReq);
        await route.fulfill({json: franchiseRes});
    });


    // DELETE STORE
    await page.route('*/**/api/franchise/1/store/42', async (route) => {
        expect(route.request().headers()['authorization']).toBe('Bearer bcdefg')
        expect(route.request().method()).toBe('DELETE');
        const franchiseRes = { message: "store deleted"}
        storeArray.pop()
        await route.fulfill({json: franchiseRes});
    });

    await page.goto('/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('link', { name: 'pf' }).click();

    await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
    await expect(page.locator('tbody')).toContainText('SLC');
    await page.getByRole('button', { name: 'Create store' }).click();
    await expect(page.getByRole('heading')).toContainText('Create store');
    await page.getByRole('textbox', { name: 'store name' }).click();
    await page.getByRole('textbox', { name: 'store name' }).fill('NEW_TEST_STORE');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.locator('tbody')).toContainText('NEW_TEST_STORE');
    await expect(page.getByRole('row', { name: 'NEW_TEST_STORE 0 ₿ Close' }).getByRole('button')).toBeVisible();
    await page.getByRole('row', { name: 'NEW_TEST_STORE 0 ₿ Close' }).getByRole('button').click();
    await expect(page.getByRole('heading')).toContainText('Sorry to see you go');
    await expect(page.getByRole('main')).toContainText('NEW_TEST_STORE');
    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.locator('tbody')).not.toContainText('NEW_TEST_STORE');
});