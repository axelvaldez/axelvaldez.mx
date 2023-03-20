---
title: Contact
description: "This form posts directly to my email inbox, but if you're just too cool to use forms, just send an email to <strong>axel<span class=\"d-none\">REMOVETHIS</span>@paskola.com</strong>."
layout: layouts/page.njk
---

<form action="/thanks" method="post" name="contact" netlify><input type="hidden" name="form-name" value="contact">
    <div class="mb-1">
        <label for="name">Name</label>
        <input type="text" class="form-control" id="name" name="name" placeholder="Your name" required="">
    </div>
    <div class="mb-1" style="display: none;">
        <label for="pot">Don't fill this one out:</label>
        <input class="form-control" name="pot">
    </div>
    <div class="mb-1">
        <label for="email">Email</label>
        <input type="email" class="form-control" id="email" name="email" placeholder="Email" required="">
    </div>
    <div class="mb-1">
        <label for="message">Your Message</label>
        <textarea class="form-control" id="message" name="message" placeholder="" rows="5 required"></textarea>
    </div>
    <div>
        <button type="submit" class="btn">Send</button>
    </div>
</form>