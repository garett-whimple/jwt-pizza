import { test, expect } from 'playwright-test-coverage';

test('franchise page not logged in', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('contentinfo').getByRole('link', { name: 'Franchise' }).click();
    await expect(page.getByRole('main')).toContainText('So you want a piece of the pie?');
    await expect(page.getByRole('alert')).toContainText('If you are already a franchisee, pleaseloginusing your franchise account');
});

test('about page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'About' }).click();
    await expect(page.getByRole('main')).toContainText('The secret sauce');
});

test('history page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'History' }).click();
    await expect(page.getByRole('heading')).toContainText('Mama Rucci, my my');
});

test('profile page', async ({ page }) => {

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

    await page.route('*/**/api/order', async (route) => {
        const loginRes = { dinerId: 1, orders: [], page: 1 };
        expect(route.request().method()).toBe('GET');
        await route.fulfill({ json: loginRes });
    });

    await page.goto('/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('link', { name: 'tu' }).click();
    await expect(page.getByRole('main')).toContainText('a@jwt.com');
    await expect(page.locator('#navbar-dark')).toContainText('Logout');
    await expect(page.getByRole('main')).toContainText('How have you lived this long without having a pizza? Buy one now!');
    await page.getByRole('link', { name: 'Logout' }).click();
    await expect(page.locator('#navbar-dark')).toContainText('Login');
});

test('register', async ({ page }) => {

    // ADMIN LOGIN
    await page.route('*/**/api/auth', async (route) => {
        const registerReq = {
            "name": "Test User",
            "email": "t@jwt.com",
            "password": "password"
        }
        const registerRes = {
            "user": {
                "name": "Test User",
                "email": "t@jwt.com",
                "roles": [
                    {
                        "role": "diner"
                    }
                ],
                "id": 17
            },
            "token": "cdefgh"
        }
        expect(route.request().method()).toBe('POST');
        expect(route.request().postDataJSON()).toMatchObject(registerReq);
        await route.fulfill({ json: registerRes });
    });

    await page.goto('/');

    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByRole('textbox', { name: 'Full name' }).click();
    await page.getByRole('textbox', { name: 'Full name' }).fill('Test User');
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('t@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('password');
    await expect(page.getByRole('heading')).toContainText('Welcome to the party');
    await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page.locator('#navbar-dark')).toContainText('Logout');
    await expect(page.locator('#navbar-dark')).not.toContainText('Register');
    await expect(page.getByLabel('Global')).toContainText('TU');
});

test('not found', async ({ page }) => {
    await page.goto('/notFound');
    await expect(page.getByRole('heading')).toContainText('Oops');
    await expect(page.getByRole('main')).toContainText('It looks like we have dropped a pizza on the floor. Please try another page.');
});