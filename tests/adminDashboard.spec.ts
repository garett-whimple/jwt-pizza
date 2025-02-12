import {expect, test} from "playwright-test-coverage";

const franchiseArray = [
    {
        id: 2,
        name: "ucbfct0pls",
        admins: [
            {
                id: 5,
                name: "pizza diner",
                email: "5qxkhwejon@test.com"
            }
        ],
        stores: [
            {
                id: 2,
                name: "8rt3bnjwqy",
                totalRevenue: 0.0002
            }
        ]
    }
]

test('admin dashboard page', async ({ page }) => {

    // ADMIN LOGIN
    await page.route('*/**/api/auth', async (route) => {
        if (route.request().method() === 'PUT') {
            const loginReq = { email: 'a@jwt.com', password: 'admin' };
            const loginRes = { user: { id: 3, name: 'test user', email: 'a@jwt.com', roles: [{ role: 'admin' }] }, token: 'abcdef' };
            expect(route.request().method()).toBe('PUT');
            expect(route.request().postDataJSON()).toMatchObject(loginReq);
            await route.fulfill({ json: loginRes });
        } else if (route.request().method() === 'DELETE') {
            expect(route.request().headers()['authorization']).toBe('Bearer abcdef')
            const logoutRes = { message: "logout successful" }
            expect(route.request().method()).toBe('DELETE');
            await route.fulfill({ json: logoutRes });
        }
    });

    // GET FRANCHISES INFO
    await page.route('*/**/api/franchise', async (route) => {
        expect(route.request().headers()['authorization']).toBe('Bearer abcdef')

        if (route.request().method() === 'GET') {
            expect(route.request().method()).toBe('GET');
            await route.fulfill({json: franchiseArray});
        } else if (route.request().method() === 'POST') {
            // CREATE FRANCHISE
            expect(route.request().method()).toBe('POST');
            const franchiseReq = {
                stores: [],
                id: "",
                name: "NEW_TEST_FRANCHISE",
                admins: [
                    {
                        email: "a@jwt.com"
                    }
                ]
            }
            const franchiseRes = {
                stores: [],
                id: 5,
                name: "NEW_TEST_FRANCHISE",
                admins: [
                    {
                        email: "a@jwt.com",
                        id: 3,
                        name: "常用名字"
                    }
                ]
            }
            franchiseArray.push(franchiseRes)
            expect(route.request().postDataJSON()).toMatchObject(franchiseReq);
            await route.fulfill({json: franchiseRes});
        }
    });

    // DELETE FRACHISE
    await page.route('*/**/api/franchise/5', async (route) => {
        expect(route.request().headers()['authorization']).toBe('Bearer abcdef')
        expect(route.request().method()).toBe('DELETE');
        const franchiseRes = { message: "franchise deleted"}
        franchiseArray.pop()
        await route.fulfill({json: franchiseRes});
    });

    await page.goto('/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('link', { name: 'tu' }).click();

    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page.getByRole('heading')).toContainText('Mama Ricci\'s kitchen');
    await expect(page.getByRole('table')).toContainText('ucbfct0pls');
    await expect(page.getByRole('table')).toContainText('8rt3bnjwqy');
    await expect(page.getByRole('button', { name: 'Add Franchise' })).toBeVisible();
    await page.getByRole('button', { name: 'Add Franchise' }).click();
    await expect(page.getByRole('heading')).toContainText('Create franchise');
    await page.getByRole('textbox', { name: 'franchise name' }).click();
    await page.getByRole('textbox', { name: 'franchise name' }).fill('NEW_TEST_FRANCHISE');
    await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
    await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('a@jwt.com');
    await expect(page.getByRole('button', { name: 'Create' })).toBeVisible();
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('cell', { name: 'NEW_TEST_FRANCHISE' })).toBeVisible();
    await expect(page.getByRole('table')).toContainText('NEW_TEST_FRANCHISE');
    await expect(page.getByRole('table')).toContainText('常用名字');
    await expect(page.getByRole('row', { name: 'NEW_TEST_FRANCHISE 常用名字 Close' }).getByRole('button')).toBeVisible();
    await page.getByRole('row', { name: 'NEW_TEST_FRANCHISE 常用名字 Close' }).getByRole('button').click();
    await expect(page.getByRole('heading')).toContainText('Sorry to see you go');
    await expect(page.getByRole('main')).toContainText('NEW_TEST_FRANCHISE');
    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
});