from datetime import datetime, timedelta

import requests
import sys

API = "http://127.0.0.1:8000"


def demo_login(role):
    r = requests.post(f"{API}/auth/demo-login", json={"role": role})
    r.raise_for_status()
    return r.json()["access_token"]


def get_json(path, token):
    r = requests.get(f"{API}{path}", headers={"Authorization": f"Bearer {token}"})
    r.raise_for_status()
    return r.json()


def post_json(path, token, payload=None):
    r = requests.post(f"{API}{path}", json=payload, headers={"Authorization": f"Bearer {token}"})
    r.raise_for_status()
    return r.json()


def patch_json(path, token, payload):
    r = requests.patch(f"{API}{path}", json=payload, headers={"Authorization": f"Bearer {token}"})
    r.raise_for_status()
    return r.json()


def assert_true(condition, message):
    if not condition:
        raise AssertionError(message)


def ensure_payable_booking(student_token, alumni_token):
    bookings = get_json('/bookings/me', student_token)
    if bookings:
        for booking in bookings:
            if booking['status'] in {'approved', 'awaiting_payment', 'paid'}:
                return booking
            if booking['status'] == 'pending':
                print('Approving pending booking', booking['id'])
                return patch_json(f"/bookings/{booking['id']}", alumni_token, {'status': 'approved'})

    print('No payable booking found; creating a fresh booking...')
    alumni_profile = get_json('/auth/me', alumni_token)
    alumni_id = alumni_profile['id']
    future_date = (datetime.utcnow() + timedelta(days=3)).strftime('%Y-%m-%d')
    future_day = (datetime.utcnow() + timedelta(days=3)).weekday()
    post_json('/availability/', alumni_token, {
        'day_of_week': future_day,
        'start_time': '09:00',
        'end_time': '09:30',
    })
    booking = post_json('/bookings/', student_token, {
        'alumni_id': alumni_id,
        'session_type': 'career_guidance',
        'date': future_date,
        'time': '09:00',
        'message': 'Automated booking flow validation',
    })
    print('Created new booking', booking['id'], 'status', booking['status'])
    return booking


if __name__ == '__main__':
    try:
        print('Logging in demo student...')
        student_token = demo_login('student')
        print('Student token received')

        print('Logging in demo alumni...')
        alumni_token = demo_login('alumni')
        print('Alumni token received')

        print('Fetching or creating a booking for validation...')
        booking = ensure_payable_booking(student_token, alumni_token)
        print('Selected booking:', booking['id'], 'status:', booking['status'])

        if booking['status'] == 'pending':
            print('Approving booking (alumni)...')
            booking = patch_json(f"/bookings/{booking['id']}", alumni_token, {'status': 'approved'})
            print('Booking approved:', booking['id'], 'status:', booking['status'])

        assert_true(booking['status'] in {'approved', 'awaiting_payment', 'paid', 'confirmed'}, 'Booking is not in an approvable state')

        print('Creating payment for booking (student)...')
        payment = post_json('/payments', student_token, {'booking_id': booking['id']})
        print('Payment created:', payment['id'], 'status:', payment['status'], 'gross_amount:', payment.get('gross_amount'))

        student_payments = get_json('/payments/me', student_token)
        payment_ids = {p['id'] for p in student_payments}
        assert_true(payment['id'] in payment_ids, 'New payment was not persisted in student payment records')

        print('Marking payment as paid (student)...')
        paid = post_json(f"/payments/{payment['id']}/mark-paid", student_token)
        print('Payment marked paid:', paid['id'], 'status:', paid['status'])

        updated_student_payments = get_json('/payments/me', student_token)
        matching_payment = next((p for p in updated_student_payments if p['id'] == payment['id']), None)
        assert_true(matching_payment is not None and matching_payment['status'] == 'PAID', 'Payment record was not updated to PAID')

        mentor_payments = get_json('/payments/mentor/me', alumni_token)
        mentor_payment = next((p for p in mentor_payments if p['id'] == payment['id']), None)
        assert_true(mentor_payment is not None, 'Payment was not visible to mentor payment records')

        print('Ensuring alumni payout settings exist...')
        payout_settings = get_json('/payments/payout-settings/me', alumni_token)
        if payout_settings is None:
            payout_settings = post_json('/payments/payout-settings', alumni_token, {
                'method': 'upi',
                'upi_id': 'demo@upi',
                'account_holder': 'Demo Alumni',
                'account_number': '1234567890',
                'ifsc': 'DEMO0001',
            })
        print('Payout settings ready:', payout_settings)

        print('Scheduling mentor payout...')
        payout_result = post_json(f"/payments/{payment['id']}/schedule-payout", alumni_token)
        print('Payout scheduled:', payout_result)

        mentor_payments_after_payout = get_json('/payments/mentor/me', alumni_token)
        mentor_payment_after_payout = next((p for p in mentor_payments_after_payout if p['id'] == payment['id']), None)
        assert_true(mentor_payment_after_payout is not None and mentor_payment_after_payout['status'] == 'PAYOUT_PENDING', 'Mentor payout was not reflected in payment status')

        print('Confirming booking (alumni)...')
        conf = patch_json(f"/bookings/{booking['id']}", alumni_token, {'status': 'confirmed'})
        print('Booking confirmed:', conf['id'], 'status:', conf['status'], 'meeting_link:', conf.get('meeting_link'))

        print('Checking notifications...')
        alumni_notifications = get_json('/notifications/me', alumni_token)
        student_notifications = get_json('/notifications/me', student_token)
        assert_true(alumni_notifications, 'No notifications were created for the alumni')
        assert_true(student_notifications, 'No notifications were created for the student')
        print('Alumni notifications:', [n['message'] for n in alumni_notifications[:3]])
        print('Student notifications:', [n['message'] for n in student_notifications[:3]])

    except Exception as e:
        print('Error during E2E flow:', e)
        sys.exit(1)

    print('E2E flow completed successfully')
